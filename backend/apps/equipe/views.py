import secrets
import string
import logging
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings
from apps.usuarios.models import Usuario
from .models import Profissional
from .serializers import ProfissionalSerializer, CriarAcessoProfissionalSerializer

logger = logging.getLogger(__name__)


class ProfissionalViewSet(viewsets.ModelViewSet):
    queryset = Profissional.objects.all().prefetch_related('servicos')
    serializer_class = ProfissionalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo']
    search_fields = ['nome', 'cargo', 'usuario__email']
    ordering_fields = ['nome', 'criado_em']
    ordering = ['nome']

    @action(detail=True, methods=['post'], url_path='criar-acesso')
    def criar_acesso(self, request, pk=None):
        profissional = self.get_object()
        serializer = CriarAcessoProfissionalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].strip().lower()
        perfil = serializer.validated_data['perfil']

        if Usuario.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'Já existe um usuário cadastrado com este e-mail.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Gerar senha temporária segura de 10 caracteres
        caracteres = string.ascii_letters + string.digits + '!@#$'
        senha_temp = ''.join(secrets.choice(caracteres) for _ in range(10))

        usuario = Usuario.objects.create_user(
            email=email,
            password=senha_temp,
            nome=profissional.nome,
            perfil=perfil,
            deve_redefinir_senha=True,
            is_staff=(perfil == 'admin'),
            is_active=profissional.ativo,
        )

        profissional.usuario = usuario
        profissional.save()

        # Enviar e-mail editorial com credenciais e link direto
        from camilo_core.email_services import enviar_email_novo_acesso_equipe
        enviar_email_novo_acesso_equipe(
            nome=profissional.nome,
            email_destino=email,
            senha_temp=senha_temp,
        )

        # Retorna sucesso sem expor a senha no JSON
        return Response({
            'message': 'Conta de acesso criada com sucesso! As credenciais provisórias foram enviadas por e-mail.',
            'email': email,
            'profissional': ProfissionalSerializer(profissional).data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='resetar-senha')
    def resetar_senha(self, request, pk=None):
        profissional = self.get_object()
        if not profissional.usuario:
            return Response(
                {'error': 'Este colaborador ainda não possui usuário de acesso cadastrado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = profissional.usuario
        caracteres = string.ascii_letters + string.digits + '!@#$'
        nova_senha_temp = ''.join(secrets.choice(caracteres) for _ in range(10))

        user.set_password(nova_senha_temp)
        user.deve_redefinir_senha = True
        user.save()

        # Invalida sessões ativas do usuário
        Token.objects.filter(user=user).delete()

        # Dispara e-mail editorial com a nova senha provisória e botão de login
        from camilo_core.email_services import enviar_email_reset_senha_admin
        enviar_email_reset_senha_admin(
            nome=profissional.nome,
            email_destino=user.email,
            nova_senha_temp=nova_senha_temp,
        )

        return Response({
            'message': f"Nova senha provisória gerada e enviada com sucesso para {user.email}.",
            'profissional': ProfissionalSerializer(profissional).data,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='toggle-ativo')
    def toggle_ativo(self, request, pk=None):
        profissional = self.get_object()
        novo_status = not profissional.ativo
        if 'ativo' in request.data:
            val = request.data['ativo']
            if isinstance(val, bool):
                novo_status = val
            elif isinstance(val, str):
                novo_status = val.lower() not in ('false', '0', 'no', 'f')
            else:
                novo_status = bool(val)

        profissional.ativo = novo_status
        profissional.save()

        if profissional.usuario:
            profissional.usuario.is_active = novo_status
            profissional.usuario.save()
            if not novo_status:
                Token.objects.filter(user=profissional.usuario).delete()

        status_str = 'ativado' if novo_status else 'desativado'
        return Response({
            'message': f"Acesso e escala do colaborador {status_str}s com sucesso.",
            'profissional': ProfissionalSerializer(profissional).data,
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        profissional = self.get_object()
        total_historico = profissional.agendamentos.count() + profissional.formulas.count()

        if total_historico > 0:
            # Soft delete: inativa acesso e remove da escala ativa
            profissional.ativo = False
            profissional.save()
            if profissional.usuario:
                profissional.usuario.is_active = False
                profissional.usuario.save()
                Token.objects.filter(user=profissional.usuario).delete()

            return Response({
                'message': f'O colaborador possui {total_historico} registro(s) vinculado(s) no histórico. O acesso foi desativado e o colaborador foi removido da escala ativa para preservar a integridade histórica.',
                'soft_deleted': True,
                'profissional': ProfissionalSerializer(profissional).data,
            }, status=status.HTTP_200_OK)

        # Exclusão definitiva se não há histórico
        user = profissional.usuario
        profissional.delete()
        if user and not user.is_superuser:
            Token.objects.filter(user=user).delete()
            user.delete()

        return Response({
            'message': 'Membro da equipe excluído definitivamente com sucesso.',
            'soft_deleted': False,
        }, status=status.HTTP_200_OK)
