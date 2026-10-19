from datetime import datetime, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.clientes.models import Cliente
from apps.equipe.models import Profissional
from apps.servicos.models import Servico
from apps.agendamentos.models import Agendamento

Usuario = get_user_model()


class AgendamentoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            email='admin@camilostudio.com',
            password='admin123',
            nome='Admin',
            perfil='admin',
        )
        login_res = self.client.post('/api/auth/login/', {'email': 'admin@camilostudio.com', 'password': 'admin123'})
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {login_res.data['token']}")

        self.cliente = Cliente.objects.create(
            nome='Larissa Manoela',
            telefone='(11) 98888-7777',
            email='larissa@teste.com'
        )
        self.prof = Profissional.objects.create(
            nome='Gabriel Camilo',
            cargo='Colorista Master'
        )
        self.servico = Servico.objects.create(
            nome='Corte Editorial',
            categoria='Cabelo',
            duracao_minutos=60,
            preco=280.00
        )

    def test_gerar_link_whatsapp_e_confirmar(self):
        ag = Agendamento.objects.create(
            cliente=self.cliente,
            profissional=self.prof,
            data_hora_inicio=timezone.now(),
            data_hora_fim=timezone.now() + timedelta(hours=1),
            valor_total=280.00,
            status='agendado'
        )
        ag.servicos.add(self.servico)

        # Gerar link WhatsApp
        res = self.client.get(f'/api/agendamentos/{ag.id}/gerar-whatsapp/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('link_whatsapp', res.data)
        self.assertIn('wa.me', res.data['link_whatsapp'])

        # Confirmar WhatsApp
        conf_res = self.client.post(f'/api/agendamentos/{ag.id}/confirmar-whatsapp/')
        self.assertEqual(conf_res.status_code, status.HTTP_200_OK)

        ag.refresh_from_db()
        self.assertEqual(ag.status, 'confirmado')

    def test_editar_agendamento(self):
        ag = Agendamento.objects.create(
            cliente=self.cliente,
            profissional=self.prof,
            data_hora_inicio=timezone.now(),
            data_hora_fim=timezone.now() + timedelta(hours=1),
            valor_total=280.00,
            status='agendado'
        )
        ag.servicos.add(self.servico)

        novo_horario = timezone.now() + timedelta(days=1)
        res = self.client.patch(f'/api/agendamentos/{ag.id}/', {
            'observacoes': 'Cliente prefere cafe sem acucar',
            'status': 'em_atendimento',
            'data_hora_inicio': novo_horario.isoformat(),
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ag.refresh_from_db()
        self.assertEqual(ag.observacoes, 'Cliente prefere cafe sem acucar')
        self.assertEqual(ag.status, 'em_atendimento')

    def test_excluir_agendamento(self):
        ag = Agendamento.objects.create(
            cliente=self.cliente,
            profissional=self.prof,
            data_hora_inicio=timezone.now(),
            data_hora_fim=timezone.now() + timedelta(hours=1),
            valor_total=280.00,
            status='agendado'
        )
        res = self.client.delete(f'/api/agendamentos/{ag.id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Agendamento.objects.filter(id=ag.id).exists())
