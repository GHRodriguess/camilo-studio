from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id',
            'email',
            'nome',
            'perfil',
            'telefone',
            'deve_redefinir_senha',
            'is_staff',
            'is_active',
            'criado_em',
        ]
        read_only_fields = ['id', 'is_staff', 'criado_em']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(error_messages={
        'invalid': 'Informe um endereço de e-mail válido.',
        'blank': 'Informe o seu e-mail.',
        'required': 'Informe o seu e-mail.',
    })
    password = serializers.CharField(
        write_only=True,
        error_messages={
            'blank': 'Informe a sua senha.',
            'required': 'Informe a sua senha.',
        }
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError('E-mail ou senha incorretos. Verifique os dados digitados.')
            if not user.is_active:
                raise serializers.ValidationError('Acesso desativado. Entre em contato com a administração.')
            attrs['user'] = user
            return attrs
        raise serializers.ValidationError('Informe e-mail e senha.')


class RedefinirSenhaPrimeiroAcessoSerializer(serializers.Serializer):
    nova_senha = serializers.CharField(min_length=6, write_only=True)
    confirmacao_senha = serializers.CharField(min_length=6, write_only=True)

    def validate(self, attrs):
        if attrs['nova_senha'] != attrs['confirmacao_senha']:
            raise serializers.ValidationError({'confirmacao_senha': 'As senhas digitadas não coincidem.'})
        return attrs


class EsqueciSenhaSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ConfirmarRedefinicaoSenhaSerializer(serializers.Serializer):
    email = serializers.EmailField()
    codigo = serializers.CharField(max_length=20, required=False)
    token = serializers.CharField(required=False)
    nova_senha = serializers.CharField(min_length=6, write_only=True)
    confirmacao_senha = serializers.CharField(min_length=6, write_only=True)

    def validate(self, attrs):
        codigo = attrs.get('codigo') or attrs.get('token')
        if not codigo:
            raise serializers.ValidationError({'codigo': 'O código de validação é obrigatório.'})
        attrs['codigo_final'] = codigo.strip()
        if attrs['nova_senha'] != attrs['confirmacao_senha']:
            raise serializers.ValidationError({'confirmacao_senha': 'As senhas digitadas não coincidem.'})
        return attrs
