from django.db import models
from apps.clientes.models import Cliente
from apps.equipe.models import Profissional
from apps.servicos.models import Servico


class Agendamento(models.Model):
    STATUS_CHOICES = (
        ('agendado', 'Agendado'),
        ('confirmado', 'Confirmado WhatsApp'),
        ('em_atendimento', 'Em Atendimento'),
        ('concluido', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    )

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='agendamentos', verbose_name='Cliente')
    profissional = models.ForeignKey(
        Profissional,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agendamentos',
        verbose_name='Profissional'
    )
    servicos = models.ManyToManyField(Servico, related_name='agendamentos', verbose_name='Serviços Contratados')

    data_hora_inicio = models.DateTimeField('Horário de Início')
    data_hora_fim = models.DateTimeField('Horário de Término Estimado')
    status = models.CharField('Status do Atendimento', max_length=30, choices=STATUS_CHOICES, default='agendado')
    valor_total = models.DecimalField('Valor Total (R$)', max_digits=10, decimal_places=2, default=0.00)
    observacoes = models.TextField('Observações do Agendamento', blank=True, default='')

    criado_em = models.DateTimeField('Criado em', auto_now_add=True)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'
        ordering = ['data_hora_inicio']

    def __str__(self):
        prof_nome = self.profissional.nome if self.profissional else 'Equipe Camilo Studio'
        return f"{self.cliente.nome} com {prof_nome} ({self.data_hora_inicio.strftime('%d/%m/%Y %H:%M')})"
