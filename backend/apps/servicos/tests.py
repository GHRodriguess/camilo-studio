from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.servicos.models import Servico

Usuario = get_user_model()


class ServicoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            email='admin@camilostudio.com',
            password='admin123',
            nome='Admin',
            perfil='admin',
        )
        login_res = self.client.post('/api/auth/login/', {'email': 'admin@camilostudio.com', 'password': 'admin123'})
        self.token = login_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_criar_e_listar_servico(self):
        create_res = self.client.post('/api/servicos/', {
            'nome': 'Mechas Balayage Especial',
            'categoria': 'Mechas',
            'duracao_minutos': 180,
            'preco': '550.00',
            'descricao': 'Técnica personalizada com efeito luminoso.',
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)

        list_res = self.client.get('/api/servicos/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_res.data['results']), 1)
