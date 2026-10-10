from django.db import models
from apps.clientes.models import Cliente
from apps.equipe.models import Profissional


class FormulaQuimica(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='formulas', verbose_name='Cliente')
    profissional = models.ForeignKey(
        Profissional,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='formulas',
        verbose_name='Profissional Responsável'
    )
    data_aplicacao = models.DateField('Data do Procedimento Químico')
    procedimento = models.CharField('Procedimento Realizado', max_length=255)
    formula_texto = models.TextField('Fórmula e Proporções (Gramaturas)')
    volumagem_ox = models.CharField('Volumagem / Oxidante (OX)', max_length=100, default='20 vol')
    tempo_pausa_minutos = models.PositiveIntegerField('Tempo de Pausa (minutos)', default=45)
    fundo_clareamento = models.CharField('Fundo de Clareamento Alcançado', max_length=100, blank=True, default='')
    observacoes = models.TextField('Observações Técnicas / Estado do Fio', blank=True, default='')
    foto_resultado_url = models.CharField('Foto do Resultado', max_length=500, blank=True, default='')

    criado_em = models.DateTimeField('Criado em', auto_now_add=True)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        verbose_name = 'Fórmula Química'
        verbose_name_plural = 'Fórmulas Químicas'
        ordering = ['-data_aplicacao', '-criado_em']

    def __str__(self):
        return f"{self.procedimento} - {self.cliente.nome} ({self.data_aplicacao})"
