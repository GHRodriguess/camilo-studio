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
        email = serializer.validated_data['email'].strip().lower()

        try:
            user = Usuario.objects.get(email__iexact=email, is_active=True)
            import secrets
            codigo_num = f"{secrets.randbelow(900000) + 100000}"

            # Invalida códigos anteriores não utilizados
            from .models import CodigoRedefinicaoSenha
            CodigoRedefinicaoSenha.objects.filter(email__iexact=email, utilizado=False).update(utilizado=True)
            CodigoRedefinicaoSenha.objects.create(email=user.email, codigo=codigo_num)

            # Enviar e-mail editorial com código em destaque e link
            from camilo_core.email_services import enviar_email_codigo_recuperacao
            enviar_email_codigo_recuperacao(
                nome=user.nome,
                email_destino=user.email,
                codigo=codigo_num,
            )

            return Response({
                'message': 'Se o e-mail estiver cadastrado, as instruções e o código foram enviados.',
            }, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            # Resposta neutra para segurança contra enumeração de usuários
            return Response({
                'message': 'Se o e-mail estiver cadastrado, as instruções e o código foram enviados.',
            }, status=status.HTTP_200_OK)


class ConfirmarRedefinicaoSenhaView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ConfirmarRedefinicaoSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].strip().lower()
        codigo = serializer.validated_data['codigo_final']
        nova_senha = serializer.validated_data['nova_senha']

        from .models import CodigoRedefinicaoSenha
        codigo_obj = CodigoRedefinicaoSenha.objects.filter(
            email__iexact=email,
            codigo=codigo,
            utilizado=False
        ).order_by('-criado_em').first()

        if not codigo_obj or not codigo_obj.is_valido():
            return Response(
                {'error': 'Código inválido ou expirado. Códigos têm validade de 15 minutos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = Usuario.objects.get(email__iexact=email, is_active=True)
            codigo_obj.utilizado = True
            codigo_obj.save()

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
            return Response({'error': 'Usuário associado ao código não encontrado ou inativo.'}, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['perfil', 'is_active', 'deve_redefinir_senha']
    search_fields = ['nome', 'email', 'telefone']
    ordering_fields = ['nome', 'criado_em']
