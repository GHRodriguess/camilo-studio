from datetime import timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.clientes.models import Cliente
from apps.servicos.models import Servico
from apps.agendamentos.models import Agendamento

Usuario = get_user_model()


class AgendamentoConflitoClienteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            email='recepcao@camilostudio.com',
            password='senha123',
            nome='Recepção',
            perfil='atendente',
        )
        login = self.client.post('/api/auth/login/', {'email': 'recepcao@camilostudio.com', 'password': 'senha123'})
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {login.data['token']}")

        self.cliente = Cliente.objects.create(
            nome='Juliana Paes',
            telefone='(11) 98111-2222',
            email='juliana@teste.com'
        )
        self.servico = Servico.objects.create(
            nome='Tratamento Fusio-Dose',
            categoria='Cabelo',
            duracao_minutos=45,
            preco=180.00
        )

        base = timezone.now() + timedelta(days=2)
        self.inicio_existente = base.replace(hour=14, minute=0, second=0, microsecond=0)
        self.fim_existente = base.replace(hour=15, minute=0, second=0, microsecond=0)

        self.ag_existente = Agendamento.objects.create(
            cliente=self.cliente,
            data_hora_inicio=self.inicio_existente,
            data_hora_fim=self.fim_existente,
            status='agendado',
            valor_total=180.00
        )
        self.ag_existente.servicos.add(self.servico)

    def test_bloqueio_criacao_sobreposta_mesma_cliente(self):
        # Tenta criar agendamento sobreposto (14:30 às 15:30) para a mesma cliente
        inicio_sobreposto = self.inicio_existente + timedelta(minutes=30)
        fim_sobreposto = self.fim_existente + timedelta(minutes=30)

        res = self.client.post('/api/agendamentos/', {
            'cliente': self.cliente.id,
            'servicos': [self.servico.id],
            'data_hora_inicio': inicio_sobreposto.isoformat(),
            'data_hora_fim': fim_sobreposto.isoformat(),
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('conflito_cliente', res.data)
        self.assertEqual(int(res.data['agendamento_id'][0]), self.ag_existente.id)

    def test_permissao_mesma_cliente_horarios_distintos(self):
        # Tenta criar agendamento no mesmo dia mas em horário livre (16:30 às 17:30)
        inicio_livre = self.inicio_existente + timedelta(hours=2, minutes=30)
        fim_livre = self.fim_existente + timedelta(hours=2, minutes=30)

        res = self.client.post('/api/agendamentos/', {
            'cliente': self.cliente.id,
            'servicos': [self.servico.id],
            'data_hora_inicio': inicio_livre.isoformat(),
            'data_hora_fim': fim_livre.isoformat(),
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_action_cliente_dia(self):
        data_str = self.inicio_existente.date().isoformat()
        res = self.client.get('/api/agendamentos/cliente-dia/', {
            'cliente_id': self.cliente.id,
            'data': data_str
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['id'], self.ag_existente.id)
