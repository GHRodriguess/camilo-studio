from django.db import models


class Servico(models.Model):
    CATEGORIA_CHOICES = (
        ('Cabelo', 'Cabelo & Corte'),
        ('Mechas', 'Mechas & Coloração'),
        ('Tratamento', 'Tratamentos & Terapia Capilar'),
        ('Penteado', 'Penteados & Escovas'),
        ('Estética', 'Estética & Sobrancelhas'),
        ('Outros', 'Outros'),
    )

    nome = models.CharField('Nome do Serviço', max_length=255)
    categoria = models.CharField('Categoria', max_length=50, choices=CATEGORIA_CHOICES, default='Cabelo')
    descricao = models.TextField('Descrição', blank=True, default='')
    duracao_minutos = models.PositiveIntegerField('Duração Estimada (minutos)', default=60)
    preco = models.DecimalField('Preço (R$)', max_digits=10, decimal_places=2)
    ativo = models.BooleanField('Ativo no Catálogo', default=True)

    criado_em = models.DateTimeField('Criado em', auto_now_add=True)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        verbose_name = 'Serviço'
        verbose_name_plural = 'Serviços'
        ordering = ['categoria', 'nome']

    def __str__(self):
        return f"{self.nome} (R$ {self.preco}) - {self.duracao_minutos} min"
