from rest_framework import status, views, permissions, viewsets
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from .models import Usuario
from .serializers import (
    UsuarioSerializer,
    LoginSerializer,
    RedefinirSenhaPrimeiroAcessoSerializer,
    EsqueciSenhaSerializer,
    ConfirmarRedefinicaoSenhaSerializer,
)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UsuarioSerializer(user).data,
        }, status=status.HTTP_200_OK)


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logout realizado com sucesso.'}, status=status.HTTP_200_OK)


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)


class RedefinirSenhaPrimeiroAcessoView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RedefinirSenhaPrimeiroAcessoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        nova_senha = serializer.validated_data['nova_senha']
        user.set_password(nova_senha)
        user.deve_redefinir_senha = False
        user.save()

        # Regenera token
        Token.objects.filter(user=user).delete()
        new_token = Token.objects.create(user=user)

        return Response({
            'message': 'Senha atualizada com sucesso!',
            'token': new_token.key,
            'user': UsuarioSerializer(user).data,
        }, status=status.HTTP_200_OK)


class EsqueciSenhaView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EsqueciSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = Usuario.objects.get(email=email, is_active=True)
            token = default_token_generator.make_token(user)
            # Enviar e-mail
            assunto = 'Recuperação de Senha — Camilo Studio'
            mensagem = (
                f"Olá, {user.nome}!\n\n"
                f"Recebemos uma solicitação de redefinição de senha para a sua conta no Camilo Studio.\n"
                f"Use o token abaixo ou o link de recuperação para definir uma nova senha:\n\n"
                f"Token: {token}\n"
                f"E-mail: {user.email}\n\n"
                f"Se você não solicitou esta alteração, ignore esta mensagem com segurança."
            )
            send_mail(
                assunto,
                mensagem,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
            return Response({
                'message': 'Se o e-mail estiver cadastrado, as instruções foram enviadas.',
                'dev_token': token if settings.DEBUG else None,
            }, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            # Resposta neutra para segurança
            return Response({
                'message': 'Se o e-mail estiver cadastrado, as instruções foram enviadas.',
            }, status=status.HTTP_200_OK)


class ConfirmarRedefinicaoSenhaView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ConfirmarRedefinicaoSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        token = serializer.validated_data['token']
        nova_senha = serializer.validated_data['nova_senha']

        try:
            user = Usuario.objects.get(email=email, is_active=True)
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'Token inválido ou expirado. Solicite uma nova redefinição.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(nova_senha)
            user.deve_redefinir_senha = False
            user.save()

            Token.objects.filter(user=user).delete()
            new_token = Token.objects.create(user=user)

            return Response({
                'message': 'Senha redefinida com sucesso!',
                'token': new_token.key,
                'user': UsuarioSerializer(user).data,
            }, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado.'}, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['perfil', 'is_active', 'deve_redefinir_senha']
    search_fields = ['nome', 'email', 'telefone']
    ordering_fields = ['nome', 'criado_em']
