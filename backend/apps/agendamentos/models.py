from django.db import models
from django.utils import timezone
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
        ('nao_compareceu', 'Não Compareceu'),
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
        prof_nome = self.profissional.nome if self.profissional else 'Equipe Studio Marilia Camilo'
        return f"{self.cliente.nome} com {prof_nome} ({self.data_hora_inicio.strftime('%d/%m/%Y %H:%M')})"

    @property
    def indicador_temporal(self):
        agora = timezone.now()
        if self.status in ['concluido', 'cancelado', 'nao_compareceu']:
            return 'encerrado'
        if self.status == 'em_atendimento':
            return 'tempo_excedido' if agora > self.data_hora_fim else 'em_andamento'
        if agora < self.data_hora_inicio:
            diff = (self.data_hora_inicio - agora).total_seconds() / 60
            return 'prestes_a_iniciar' if diff <= 30 else 'futuro'
        return 'atrasado'

    @property
    def tempo_relativo_display(self):
        agora = timezone.now()
        if self.status in ['concluido', 'cancelado', 'nao_compareceu']:
            return self.get_status_display()
        if self.status == 'em_atendimento':
            if agora > self.data_hora_fim:
                mins = int((agora - self.data_hora_fim).total_seconds() // 60)
                return f"Tempo excedido em {mins} min"
            decorrido = int((agora - self.data_hora_inicio).total_seconds() // 60)
            return f"Em andamento há {max(0, decorrido)} min"
        if agora < self.data_hora_inicio:
            diff = int((self.data_hora_inicio - agora).total_seconds() // 60)
            if diff < 60:
                return f"Começa em {diff} min"
            horas = diff // 60
            restante_m = diff % 60
            return f"Começa em {horas}h {restante_m}min" if restante_m else f"Começa em {horas}h"
        atraso = int((agora - self.data_hora_inicio).total_seconds() // 60)
        return f"Aguardando início • atrasado {atraso} min"

