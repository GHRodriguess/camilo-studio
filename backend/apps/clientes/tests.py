from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Cliente

Usuario = get_user_model()


class ClienteValidacaoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            email='admin@studiomariliacamilo.com',
            password='admin123',
            nome='Admin',
            perfil='admin',
        )
        login_res = self.client.post('/api/auth/login/', {'email': 'admin@studiomariliacamilo.com', 'password': 'admin123'})
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {login_res.data['token']}")

    def test_cadastrar_cliente_telefone_valido(self):
        payload = {
            'nome': 'Juliana Paes',
            'telefone': '11987654321',
        }
        res = self.client.post('/api/clientes/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['telefone'], '(11) 98765-4321')

    def test_cadastrar_cliente_telefone_invalido_poucos_digitos(self):
        payload = {
            'nome': 'Juliana Paes',
            'telefone': '12345',
        }
        res = self.client.post('/api/clientes/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telefone', res.data)

    def test_cadastrar_cliente_telefone_ddd_invalido(self):
        payload = {
            'nome': 'Juliana Paes',
            'telefone': '05987654321',
        }
        res = self.client.post('/api/clientes/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telefone', res.data)

    def test_cadastrar_cliente_celular_nao_comeca_com_nove(self):
        payload = {
            'nome': 'Juliana Paes',
            'telefone': '11887654321',
        }
        res = self.client.post('/api/clientes/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telefone', res.data)
