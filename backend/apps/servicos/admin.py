from django.contrib import admin
from .models import Servico


@admin.register(Servico)
class ServicoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'duracao_minutos', 'preco', 'ativo')
    list_filter = ('categoria', 'ativo')
    search_fields = ('nome', 'descricao')
