from django.contrib import admin
from .models import Profissional


@admin.register(Profissional)
class ProfissionalAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cargo', 'cadeira', 'horario_inicio', 'horario_fim', 'ativo')
    list_filter = ('ativo', 'cadeira')
    search_fields = ('nome', 'cargo', 'cadeira')
    filter_horizontal = ('servicos',)
