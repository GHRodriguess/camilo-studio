from django.contrib import admin
from .models import Cliente


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'telefone', 'email', 'tags', 'visitas_realizadas', 'total_investido', 'ultima_visita')
    search_fields = ('nome', 'telefone', 'email', 'tags')
