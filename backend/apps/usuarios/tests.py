from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

Usuario = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            email='test@camilostudio.com',
            password='secretpassword123',
            nome='Profissional Teste',
            perfil='profissional',
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'test@camilostudio.com',
            'password': 'secretpassword123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'test@camilostudio.com')

    def test_login_invalid_credentials(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'test@camilostudio.com',
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_primeiro_acesso_redefinir_senha(self):
        self.user.deve_redefinir_senha = True
        self.user.save()

        # Login para obter token
        login_res = self.client.post('/api/auth/login/', {
            'email': 'test@camilostudio.com',
            'password': 'secretpassword123',
        })
        token = login_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

        # Redefinir
        reset_res = self.client.post('/api/auth/redefinir-senha/', {
            'nova_senha': 'newsecretpass123',
            'confirmacao_senha': 'newsecretpass123',
        })
        self.assertEqual(reset_res.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertFalse(self.user.deve_redefinir_senha)
        self.assertTrue(self.user.check_password('newsecretpass123'))

    def test_esqueci_senha_envio_codigo_e_confirmacao(self):
        from apps.usuarios.models import CodigoRedefinicaoSenha

        # 1. Solicita recuperação de senha
        res = self.client.post('/api/auth/esqueci-senha/', {'email': 'test@camilostudio.com'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Garante que não vaza token nem código no payload da resposta
        self.assertNotIn('dev_token', res.data)
        self.assertNotIn('codigo', res.data)

        # 2. Verifica se o código foi registrado no banco
        codigo_obj = CodigoRedefinicaoSenha.objects.filter(email='test@camilostudio.com', utilizado=False).first()
        self.assertIsNotNone(codigo_obj)
        self.assertEqual(len(codigo_obj.codigo), 6)
        self.assertTrue(codigo_obj.codigo.isdigit())
        self.assertTrue(codigo_obj.is_valido())

        # 3. Confirma redefinição com código correto
        res_confirm = self.client.post('/api/auth/confirmar-redefinicao/', {
            'email': 'test@camilostudio.com',
            'codigo': codigo_obj.codigo,
            'nova_senha': 'senhaNova123!',
            'confirmacao_senha': 'senhaNova123!',
        })
        self.assertEqual(res_confirm.status_code, status.HTTP_200_OK)

        codigo_obj.refresh_from_db()
        self.assertTrue(codigo_obj.utilizado)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('senhaNova123!'))

    def test_codigo_expirado_falha(self):
        from datetime import timedelta
        from django.utils import timezone
        from apps.usuarios.models import CodigoRedefinicaoSenha

        codigo_obj = CodigoRedefinicaoSenha.objects.create(
            email='test@camilostudio.com',
            codigo='654321',
        )
        # Simula criação há 16 minutos atrás
        CodigoRedefinicaoSenha.objects.filter(pk=codigo_obj.pk).update(
            criado_em=timezone.now() - timedelta(minutes=16)
        )
        codigo_obj.refresh_from_db()
        self.assertFalse(codigo_obj.is_valido())

        res = self.client.post('/api/auth/confirmar-redefinicao/', {
            'email': 'test@camilostudio.com',
            'codigo': '654321',
            'nova_senha': 'senhaNova123!',
            'confirmacao_senha': 'senhaNova123!',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expirado', res.data['error'].lower())
