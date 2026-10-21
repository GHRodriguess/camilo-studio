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
        hora_local_esperada = timezone.localtime(ag.data_hora_inicio).strftime('%H:%M')
        self.assertIn(hora_local_esperada, res.data['mensagem'])

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

    def test_bloqueio_agendamento_no_passado(self):
        horario_passado = timezone.now() - timedelta(hours=2)
        res = self.client.post('/api/agendamentos/', {
            'cliente': self.cliente.id,
            'servicos': [self.servico.id],
            'data_hora_inicio': horario_passado.isoformat(),
            'data_hora_fim': (horario_passado + timedelta(hours=1)).isoformat(),
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('data_hora_inicio', res.data)

    def test_criacao_agendamento_futuro_sucesso(self):
        horario_futuro = timezone.now() + timedelta(hours=3)
        res = self.client.post('/api/agendamentos/', {
            'cliente': self.cliente.id,
            'servicos': [self.servico.id],
            'data_hora_inicio': horario_futuro.isoformat(),
            'data_hora_fim': (horario_futuro + timedelta(hours=1)).isoformat(),
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['indicador_temporal'], 'futuro')

    def test_transicoes_status_inteligentes(self):
        ag = Agendamento.objects.create(
            cliente=self.cliente,
            profissional=self.prof,
            data_hora_inicio=timezone.now() + timedelta(hours=1),
            data_hora_fim=timezone.now() + timedelta(hours=2),
            status='agendado'
        )

        # Iniciar
        res = self.client.post(f'/api/agendamentos/{ag.id}/iniciar/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ag.refresh_from_db()
        self.assertEqual(ag.status, 'em_atendimento')

        # Concluir
        res = self.client.post(f'/api/agendamentos/{ag.id}/concluir/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ag.refresh_from_db()
        self.assertEqual(ag.status, 'concluido')

        # Não compareceu em novo agendamento
        ag2 = Agendamento.objects.create(
            cliente=self.cliente,
            profissional=self.prof,
            data_hora_inicio=timezone.now() + timedelta(hours=1),
            data_hora_fim=timezone.now() + timedelta(hours=2),
            status='agendado'
        )
        res = self.client.post(f'/api/agendamentos/{ag2.id}/nao-compareceu/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ag2.refresh_from_db()
        self.assertEqual(ag2.status, 'nao_compareceu')

    def test_consulta_conflitos_e_criacao_nao_restritiva(self):
        base = timezone.now() + timedelta(days=2)
        ag1 = Agendamento.objects.create(
            cliente=self.cliente,
            profissional=self.prof,
            data_hora_inicio=base.replace(hour=14, minute=0, second=0, microsecond=0),
            data_hora_fim=base.replace(hour=16, minute=0, second=0, microsecond=0),
            status='confirmado'
        )
        ag1.servicos.add(self.servico)

        # Agendamento cancelado no mesmo horário (deve ser ignorado)
        ag_cancelado = Agendamento.objects.create(
            cliente=self.cliente,
            data_hora_inicio=base.replace(hour=14, minute=30, second=0, microsecond=0),
            data_hora_fim=base.replace(hour=15, minute=30, second=0, microsecond=0),
            status='cancelado'
        )

        # Consulta intervalo com sobreposição (15:00 às 17:00)
        inicio_busca = (base.replace(hour=15, minute=0, second=0, microsecond=0)).isoformat()
        fim_busca = (base.replace(hour=17, minute=0, second=0, microsecond=0)).isoformat()
        res = self.client.get('/api/agendamentos/conflitos/', {'inicio': inicio_busca, 'fim': fim_busca})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in res.data]
        self.assertIn(ag1.id, ids)
        self.assertNotIn(ag_cancelado.id, ids)

        # Teste com exclude_id
        res_excl = self.client.get('/api/agendamentos/conflitos/', {
            'inicio': inicio_busca,
            'fim': fim_busca,
            'exclude_id': ag1.id
        })
        self.assertEqual(res_excl.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_excl.data), 0)

        # Teste de criação não-restritiva (deve permitir salvar mesmo com conflito)
        res_create = self.client.post('/api/agendamentos/', {
            'cliente': self.cliente.id,
            'servicos': [self.servico.id],
            'data_hora_inicio': inicio_busca,
            'data_hora_fim': fim_busca,
        }, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)


