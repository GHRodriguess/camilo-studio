from django.contrib import admin
from .models import FormulaQuimica


@admin.register(FormulaQuimica)
class FormulaQuimicaAdmin(admin.ModelAdmin):
    list_display = ('procedimento', 'cliente', 'profissional', 'data_aplicacao', 'volumagem_ox', 'tempo_pausa_minutos')
    list_filter = ('volumagem_ox', 'data_aplicacao')
    search_fields = ('procedimento', 'formula_texto', 'cliente__nome')
