from django.db import models
from django.conf import settings
from apps.servicos.models import Servico


class Profissional(models.Model):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='perfil_profissional'
    )
    nome = models.CharField('Nome do Profissional', max_length=255)
    cargo = models.CharField('Cargo / Especialidade', max_length=255, default='Hair Stylist')
    cadeira = models.CharField('Cadeira / Estação de Trabalho', max_length=100, default='Cadeira 01')
    cor_hex = models.CharField('Cor de Identificação', max_length=20, default='#7C3AED')
    foto_url = models.CharField('URL da Foto / Avatar', max_length=500, blank=True, default='')

    horario_inicio = models.CharField('Horário de Entrada', max_length=10, default='09:00')
    horario_fim = models.CharField('Horário de Saída', max_length=10, default='19:00')
    dias_semana = models.CharField('Dias de Trabalho', max_length=100, default='ter,qua,qui,sex,sab')

    servicos = models.ManyToManyField(Servico, blank=True, related_name='profissionais', verbose_name='Serviços Habilitados')
    ativo = models.BooleanField('Ativo na Escala', default=True)

    criado_em = models.DateTimeField('Criado em', auto_now_add=True)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        verbose_name = 'Profissional'
        verbose_name_plural = 'Equipe & Profissionais'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.cargo}) - {self.cadeira}"
