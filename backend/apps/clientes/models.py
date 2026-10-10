from django.db import models


class Cliente(models.Model):
    nome = models.CharField('Nome Completo', max_length=255)
    telefone = models.CharField('WhatsApp / Celular', max_length=30)
    email = models.EmailField('E-mail', blank=True, default='')
    data_nascimento = models.DateField('Data de Nascimento', null=True, blank=True)
    signo = models.CharField('Signo', max_length=30, blank=True, default='')
    foto_url = models.CharField('Foto / Avatar', max_length=500, blank=True, default='')

    tags = models.CharField('Tags de Perfil (separadas por vírgula)', max_length=255, blank=True, default='Frequente')
    observacoes_alergias = models.TextField('Alergias e Restrições Químicas', blank=True, default='')
    preferencias_sensoriais = models.TextField('Preferências Sensoriais & Cuidados', blank=True, default='')

    total_investido = models.DecimalField('Total Investido (R$)', max_digits=10, decimal_places=2, default=0.00)
    visitas_realizadas = models.PositiveIntegerField('Total de Visitas Realizadas', default=0)
    ultima_visita = models.DateField('Data da Última Visita', null=True, blank=True)

    criado_em = models.DateTimeField('Criado em', auto_now_add=True)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.telefone})"
