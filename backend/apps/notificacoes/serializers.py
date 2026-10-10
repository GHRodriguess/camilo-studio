from rest_framework import serializers
from .models import NotificacaoWhatsApp, ConfiguracaoAtelie


class NotificacaoWhatsAppSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = NotificacaoWhatsApp
        fields = [
            'id',
            'agendamento',
            'cliente',
            'tipo',
            'tipo_display',
            'telefone_destino',
            'mensagem',
            'link_whatsapp',
            'status_envio',
            'criado_em',
        ]


class ConfiguracaoAtelieSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracaoAtelie
        fields = [
            'id',
            'nome_atelie',
            'slogan',
            'telefone',
            'email',
            'endereco',
            'horario_funcionamento',
            'template_confirmacao',
            'template_lembrete',
            'politica_cancelamento',
            'atualizado_em',
        ]
