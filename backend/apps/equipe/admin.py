from django.contrib import admin
from .models import Profissional


@admin.register(Profissional)
class ProfissionalAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cargo', 'ativo')
    list_filter = ('ativo',)
    search_fields = ('nome', 'cargo')
    filter_horizontal = ('servicos',)
