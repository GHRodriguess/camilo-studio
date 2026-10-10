from rest_framework import serializers
from .models import FormulaQuimica
from apps.equipe.serializers import ProfissionalSerializer


class FormulaQuimicaSerializer(serializers.ModelSerializer):
    profissional_detalhes = ProfissionalSerializer(source='profissional', read_only=True)
    nome_cliente = serializers.CharField(source='cliente.nome', read_only=True)

    class Meta:
        model = FormulaQuimica
        fields = [
            'id',
            'cliente',
            'nome_cliente',
            'profissional',
            'profissional_detalhes',
            'data_aplicacao',
            'procedimento',
            'formula_texto',
            'volumagem_ox',
            'tempo_pausa_minutos',
            'fundo_clareamento',
            'observacoes',
            'foto_resultado_url',
            'criado_em',
            'atualizado_em',
        ]
