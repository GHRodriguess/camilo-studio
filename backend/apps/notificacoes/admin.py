from django.contrib import admin
from .models import NotificacaoWhatsApp, ConfiguracaoAtelie


@admin.register(NotificacaoWhatsApp)
class NotificacaoWhatsAppAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'telefone_destino', 'status_envio', 'criado_em')
    list_filter = ('tipo', 'status_envio', 'criado_em')
    search_fields = ('telefone_destino', 'mensagem')


@admin.register(ConfiguracaoAtelie)
class ConfiguracaoAtelieAdmin(admin.ModelAdmin):
    list_display = ('nome_atelie', 'telefone', 'email', 'atualizado_em')
