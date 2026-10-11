import urllib.parse
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Agendamento
from .serializers import AgendamentoSerializer
from apps.notificacoes.models import ConfiguracaoAtelie, NotificacaoWhatsApp


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all().select_related('cliente', 'profissional').prefetch_related('servicos')
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'profissional', 'cliente']
    search_fields = ['cliente__nome', 'profissional__nome', 'observacoes']
    ordering_fields = ['data_hora_inicio', 'status', 'criado_em']
    ordering = ['data_hora_inicio']

    @action(detail=True, methods=['get', 'post'], url_path='gerar-whatsapp')
    def gerar_whatsapp(self, request, pk=None):
        agendamento = self.get_object()
        config = ConfiguracaoAtelie.get_solo()

        cliente_nome = agendamento.cliente.nome
        data_formatada = agendamento.data_hora_inicio.strftime('%d/%m/%Y')
        horario_formatado = agendamento.data_hora_inicio.strftime('%H:%M')
        profissional_nome = agendamento.profissional.nome if agendamento.profissional else "Equipe Camilo Studio"
        servicos_nomes = ", ".join(s.nome for s in agendamento.servicos.all()) or "Serviços Camilo Studio"
        valor_str = f"{agendamento.valor_total:.2f}".replace('.', ',')

        template = config.template_confirmacao
        mensagem = template.format(
            cliente=cliente_nome,
            data=data_formatada,
            horario=horario_formatado,
            profissional=profissional_nome,
            servicos=servicos_nomes,
            valor=valor_str,
            endereco=config.endereco
        )

        # Limpar telefone apenas para números
        telefone_limpo = ''.join(filter(str.isdigit, agendamento.cliente.telefone))
        if not telefone_limpo.startswith('55') and len(telefone_limpo) in [10, 11]:
            telefone_limpo = '55' + telefone_limpo

        texto_encoded = urllib.parse.quote(mensagem)
        link_whatsapp = f"https://wa.me/{telefone_limpo}?text={texto_encoded}"

        # Registrar log em NotificacaoWhatsApp
        notificacao = NotificacaoWhatsApp.objects.create(
            agendamento=agendamento,
            cliente=agendamento.cliente,
            tipo='confirmacao',
            telefone_destino=agendamento.cliente.telefone,
            mensagem=mensagem,
            link_whatsapp=link_whatsapp,
            status_envio='gerado'
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
