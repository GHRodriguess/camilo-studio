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
