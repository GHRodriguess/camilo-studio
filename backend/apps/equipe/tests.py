from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.equipe.models import Profissional
from apps.clientes.models import Cliente
from apps.agendamentos.models import Agendamento
from django.utils import timezone

Usuario = get_user_model()


class EquipeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Usuario.objects.create_superuser(
            email='admin@studiomariliacamilo.com',
            password='adminpassword123',
            nome='Admin Master'
        )
        self.client.force_authenticate(user=self.admin)

        self.prof = Profissional.objects.create(
            nome='Mariana Colorista',
            cargo='Colorista Master',
            cor_hex='#7C3AED',
            ativo=True
        )

    def test_criar_acesso_sem_expor_senha_na_resposta(self):
        res = self.client.post(f'/api/profissionais/{self.prof.id}/criar-acesso/', {
            'email': 'mariana@studiomariliacamilo.com',
            'perfil': 'profissional'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # Confidencialidade: senha_temp NÃO deve existir no retorno
        self.assertNotIn('senha_temp', res.data)

        self.prof.refresh_from_db()
        self.assertIsNotNone(self.prof.usuario)
        self.assertEqual(self.prof.usuario.email, 'mariana@studiomariliacamilo.com')
        self.assertTrue(self.prof.usuario.deve_redefinir_senha)

    def test_resetar_senha(self):
        # Primeiro cria acesso
        self.client.post(f'/api/profissionais/{self.prof.id}/criar-acesso/', {
            'email': 'mariana@studiomariliacamilo.com',
            'perfil': 'profissional'
        })
        self.prof.refresh_from_db()
        usuario_criado = self.prof.usuario
        usuario_criado.deve_redefinir_senha = False
        usuario_criado.save()

        # Reseta senha
        res = self.client.post(f'/api/profissionais/{self.prof.id}/resetar-senha/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertNotIn('nova_senha', res.data)

        usuario_criado.refresh_from_db()
        self.assertTrue(usuario_criado.deve_redefinir_senha)

    def test_toggle_ativo(self):
        # Cria acesso
        self.client.post(f'/api/profissionais/{self.prof.id}/criar-acesso/', {
            'email': 'mariana@studiomariliacamilo.com',
            'perfil': 'profissional'
        })
        self.prof.refresh_from_db()
        self.assertTrue(self.prof.ativo)
        self.assertTrue(self.prof.usuario.is_active)

        # Desativa
        res = self.client.post(f'/api/profissionais/{self.prof.id}/toggle-ativo/', {'ativo': False})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.prof.refresh_from_db()
        self.assertFalse(self.prof.ativo)
        self.assertFalse(self.prof.usuario.is_active)

        # Reativa
        res = self.client.post(f'/api/profissionais/{self.prof.id}/toggle-ativo/', {'ativo': True})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.prof.refresh_from_db()
        self.assertTrue(self.prof.ativo)
        self.assertTrue(self.prof.usuario.is_active)

    def test_exclusao_com_historico_aplica_soft_delete(self):
        cliente = Cliente.objects.create(nome='Cliente Teste', telefone='11999999999')
        agora = timezone.now()
        Agendamento.objects.create(
            cliente=cliente,
            profissional=self.prof,
            data_hora_inicio=agora,
            data_hora_fim=agora + timezone.timedelta(hours=1),
        )

        res = self.client.delete(f'/api/profissionais/{self.prof.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['soft_deleted'])

        # Garante que o registro do profissional ainda existe mas desativado
        self.prof.refresh_from_db()
        self.assertFalse(self.prof.ativo)

    def test_exclusao_sem_historico_aplica_hard_delete(self):
        res = self.client.delete(f'/api/profissionais/{self.prof.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['soft_deleted'])
        self.assertFalse(Profissional.objects.filter(id=self.prof.id).exists())
