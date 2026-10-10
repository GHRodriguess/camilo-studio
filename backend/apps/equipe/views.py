import secrets
import string
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings
from apps.usuarios.models import Usuario
from .models import Profissional
from .serializers import ProfissionalSerializer, CriarAcessoProfissionalSerializer


class ProfissionalViewSet(viewsets.ModelViewSet):
    queryset = Profissional.objects.all().prefetch_related('servicos')
    serializer_class = ProfissionalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo', 'cadeira']
    search_fields = ['nome', 'cargo', 'cadeira']
    ordering_fields = ['nome', 'cadeira', 'criado_em']
    ordering = ['nome']

    @action(detail=True, methods=['post'], url_path='criar-acesso')
    def criar_acesso(self, request, pk=None):
        profissional = self.get_object()
        serializer = CriarAcessoProfissionalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        perfil = serializer.validated_data['perfil']

        if Usuario.objects.filter(email=email).exists():
            return Response(
                {'error': 'Já existe um usuário cadastrado com este e-mail.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Gerar senha temporária segura
        caracteres = string.ascii_letters + string.digits + '!@#$'
        senha_temp = ''.join(secrets.choice(caracteres) for _ in range(10))

        usuario = Usuario.objects.create_user(
            email=email,
            password=senha_temp,
            nome=profissional.nome,
            perfil=perfil,
            deve_redefinir_senha=True,
            is_staff=(perfil == 'admin'),
        )

        profissional.usuario = usuario
        profissional.save()

        # Enviar e-mail com senha provisória
        assunto = 'Bem-vindo(a) à equipe do Camilo Studio — Seu Acesso'
        mensagem = (
            f"Olá, {profissional.nome}!\n\n"
            f"Seu acesso ao sistema do Camilo Studio foi criado com sucesso.\n"
            f"Acesse com suas credenciais provisórias e redefina sua senha no primeiro login:\n\n"
            f"E-mail: {email}\n"
            f"Senha Provisória: {senha_temp}\n\n"
            f"No primeiro acesso, você será solicitado(a) a criar uma nova senha pessoal."
        )
        send_mail(
            assunto,
            mensagem,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=True,
        )

        return Response({
            'message': 'Conta de acesso criada com sucesso! Instruções enviadas por e-mail.',
            'email': email,
            'senha_temp': senha_temp if settings.DEBUG else None,
            'profissional': ProfissionalSerializer(profissional).data,
        }, status=status.HTTP_201_CREATED)
