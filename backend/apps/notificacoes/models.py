from django.db import models
from apps.clientes.models import Cliente
from apps.agendamentos.models import Agendamento


class NotificacaoWhatsApp(models.Model):
    TIPO_CHOICES = (
        ('confirmacao', 'Confirmação de Agendamento'),
        ('lembrete_24h', 'Lembrete de 24 Horas'),
        ('comprovante', 'Comprovante / Recibo Digital'),
    )
    STATUS_CHOICES = (
        ('gerado', 'Link Gerado'),
        ('enviado', 'Enviado / Confirmado'),
        ('falha', 'Falha'),
    )

    agendamento = models.ForeignKey(
        Agendamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notificacoes',
        verbose_name='Agendamento'
    )
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notificacoes',
        verbose_name='Cliente'
    )
    tipo = models.CharField('Tipo de Notificação', max_length=30, choices=TIPO_CHOICES, default='confirmacao')
    telefone_destino = models.CharField('Telefone / WhatsApp Destino', max_length=30)
    mensagem = models.TextField('Texto da Mensagem')
    link_whatsapp = models.TextField('Link Direto (wa.me)')
    status_envio = models.CharField('Status do Envio', max_length=20, choices=STATUS_CHOICES, default='gerado')

    criado_em = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        verbose_name = 'Notificação WhatsApp'
        verbose_name_plural = 'Notificações WhatsApp'
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.get_tipo_display()} para {self.telefone_destino} ({self.status_envio})"


class ConfiguracaoAtelie(models.Model):
    nome_atelie = models.CharField('Nome do Ateliê', max_length=255, default='Camilo Studio')
    slogan = models.CharField('Slogan / Subtítulo', max_length=255, default='Haute Coiffure & Estética Avançada')
    telefone = models.CharField('Telefone Comercial WhatsApp', max_length=30, default='+55 11 98765-4321')
    email = models.EmailField('E-mail Institucional', default='contato@camilostudio.com')
    endereco = models.CharField('Endereço Completo', max_length=255, default='Rua Oscar Freire, 1200 - Jardins, São Paulo - SP')
    horario_funcionamento = models.CharField('Horário de Atendimento', max_length=255, default='Terça a Sábado, das 09h às 20h')

    template_confirmacao = models.TextField(
        'Template de Confirmação',
        default="Olá, {cliente}! ✨\nSeu agendamento no *Camilo Studio* está confirmado para o dia *{data}* às *{horario}* com *{profissional}*.\n\nServiços: {servicos}\nValor estimado: R$ {valor}\n\nLocal: {endereco}\n\nNos vemos em breve para uma experiência incrível! 💜"
    )
    template_lembrete = models.TextField(
        'Template de Lembrete',
        default="Olá, {cliente}! ✨ Lembramos do seu horário amanhã, dia *{data}* às *{horario}*, no *Camilo Studio*. Por favor, responda com SIM para confirmar sua presença."
    )
    politica_cancelamento = models.TextField(
        'Política de Cancelamento',
        default="Pedimos a gentileza de avisar com pelo menos 24 horas de antecedência em caso de reagendamento ou cancelamento."
    )

    atualizado_em = models.DateTimeField('Última Atualização', auto_now=True)

    class Meta:
        verbose_name = 'Configuração do Ateliê'
        verbose_name_plural = 'Configurações do Ateliê'

    def __str__(self):
        return self.nome_atelie

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj
