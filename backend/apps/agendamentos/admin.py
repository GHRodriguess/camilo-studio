from django.contrib import admin
from .models import Agendamento


@admin.register(Agendamento)
class AgendamentoAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'profissional', 'data_hora_inicio', 'status', 'valor_total')
    list_filter = ('status', 'profissional', 'data_hora_inicio')
    search_fields = ('cliente__nome', 'profissional__nome')
    filter_horizontal = ('servicos',)
