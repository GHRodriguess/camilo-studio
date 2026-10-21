import datetime
import urllib.parse
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Agendamento
from .serializers import AgendamentoSerializer
from apps.notificacoes.models import ConfiguracaoAtelie, NotificacaoWhatsApp


class AgendamentoPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'page_size': self.get_page_size(self.request),
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all().select_related('cliente', 'profissional').prefetch_related('servicos')
    serializer_class = AgendamentoSerializer
    pagination_class = AgendamentoPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'profissional', 'cliente']
    search_fields = ['cliente__nome', 'profissional__nome', 'observacoes']
    ordering_fields = ['data_hora_inicio', 'status', 'criado_em']
    ordering = ['data_hora_inicio']

    def get_queryset(self):
        qs = super().get_queryset()
        filtro = self.request.query_params.get('filtro')
        if not filtro:
            return qs

        agora = timezone.now()
        hoje_local = timezone.localdate()

        if filtro == 'proximos':
            return qs.exclude(status__in=['concluido', 'cancelado', 'nao_compareceu']).filter(
                Q(status='em_atendimento') |
                Q(data_hora_fim__gte=agora) |
                Q(data_hora_inicio__date=hoje_local) |
                Q(data_hora_inicio__gte=agora)
            )

        if filtro == 'hoje':
            return qs.filter(data_hora_inicio__date=hoje_local)

        if filtro == 'todos':
            return qs

        if filtro in dict(Agendamento.STATUS_CHOICES):
            return qs.filter(status=filtro)

        return qs

    def _montar_dados_whatsapp(self, agendamento, config):
        cliente_nome = agendamento.cliente.nome
        data_local = timezone.localtime(agendamento.data_hora_inicio)
        profissional_nome = agendamento.profissional.nome if agendamento.profissional else "Equipe Camilo Studio"
        servicos_nomes = ", ".join(s.nome for s in agendamento.servicos.all()) or "Serviços Camilo Studio"
        valor_str = f"{agendamento.valor_total:.2f}".replace('.', ',')

        mensagem = config.template_confirmacao.format(
            cliente=cliente_nome,
            data=data_local.strftime('%d/%m/%Y'),
            horario=data_local.strftime('%H:%M'),
            profissional=profissional_nome,
            servicos=servicos_nomes,
            valor=valor_str,
            endereco=config.endereco,
        )

        telefone_limpo = ''.join(filter(str.isdigit, agendamento.cliente.telefone))
        if not telefone_limpo.startswith('55') and len(telefone_limpo) in [10, 11]:
            telefone_limpo = '55' + telefone_limpo

        texto_encoded = urllib.parse.quote(mensagem)
        link = f"https://wa.me/{telefone_limpo}?text={texto_encoded}"
        return cliente_nome, telefone_limpo, mensagem, link

    @action(detail=True, methods=['get', 'post'], url_path='gerar-whatsapp')
    def gerar_whatsapp(self, request, pk=None):
        agendamento = self.get_object()
        config = ConfiguracaoAtelie.get_solo()
        cliente_nome, telefone_limpo, mensagem, link_whatsapp = self._montar_dados_whatsapp(agendamento, config)

        notificacao = NotificacaoWhatsApp.objects.create(
            agendamento=agendamento,
            cliente=agendamento.cliente,
            tipo='confirmacao',
            telefone_destino=agendamento.cliente.telefone,
            mensagem=mensagem,
            link_whatsapp=link_whatsapp,
            status_envio='gerado',
        )

        return Response({
            'agendamento_id': agendamento.id,
            'cliente': cliente_nome,
            'telefone': agendamento.cliente.telefone,
            'telefone_link': telefone_limpo,
            'mensagem': mensagem,
            'link_whatsapp': link_whatsapp,
            'notificacao_id': notificacao.id,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='confirmar-whatsapp')
    def confirmar_whatsapp(self, request, pk=None):
        agendamento = self.get_object()
        agendamento.status = 'confirmado'
        agendamento.save()

        # Atualiza status da notificação recente
        NotificacaoWhatsApp.objects.filter(agendamento=agendamento).update(status_envio='enviado')

        return Response({
            'message': 'Agendamento confirmado via WhatsApp com sucesso!',
            'agendamento': AgendamentoSerializer(agendamento).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='iniciar')
    def iniciar(self, request, pk=None):
        agendamento = self.get_object()
        if agendamento.status in ['concluido', 'cancelado', 'nao_compareceu']:
            return Response(
                {'detail': f'Não é possível iniciar atendimento já {agendamento.get_status_display().lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        agendamento.status = 'em_atendimento'
        agendamento.save()
        return Response(AgendamentoSerializer(agendamento).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='concluir')
    def concluir(self, request, pk=None):
        agendamento = self.get_object()
        if agendamento.status in ['cancelado', 'nao_compareceu']:
            return Response(
                {'detail': f'Não é possível concluir atendimento {agendamento.get_status_display().lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        agendamento.status = 'concluido'
        agendamento.save()
        return Response(AgendamentoSerializer(agendamento).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='nao-compareceu')
    def nao_compareceu(self, request, pk=None):
        agendamento = self.get_object()
        agendamento.status = 'nao_compareceu'
        agendamento.save()
        return Response(AgendamentoSerializer(agendamento).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='cancelar')
    def cancelar(self, request, pk=None):
        agendamento = self.get_object()
        agendamento.status = 'cancelado'
        agendamento.save()
        return Response(AgendamentoSerializer(agendamento).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='conflitos')
    def conflitos(self, request):
        inicio_str = request.query_params.get('inicio')
        fim_str = request.query_params.get('fim')
        exclude_id = request.query_params.get('exclude_id')

        if not inicio_str or not fim_str:
            return Response(
                {'detail': 'Os parâmetros "inicio" e "fim" são obrigatórios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            clean_inicio = inicio_str.strip().replace(' ', '+').replace('Z', '+00:00')
            clean_fim = fim_str.strip().replace(' ', '+').replace('Z', '+00:00')
            dt_inicio = datetime.datetime.fromisoformat(clean_inicio)
            dt_fim = datetime.datetime.fromisoformat(clean_fim)
            if timezone.is_naive(dt_inicio):
                dt_inicio = timezone.make_aware(dt_inicio)
            if timezone.is_naive(dt_fim):
                dt_fim = timezone.make_aware(dt_fim)
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Formato inválido de data/hora. Use o formato ISO 8601.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        qs = self.get_queryset().filter(
            status__in=['agendado', 'confirmado', 'em_atendimento'],
            data_hora_inicio__lt=dt_fim,
            data_hora_fim__gt=dt_inicio,
        )

        if exclude_id:
            qs = qs.exclude(id=exclude_id)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


