from rest_framework import serializers
from .models import Cliente
from apps.formulas.serializers import FormulaQuimicaSerializer


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'id',
            'nome',
            'telefone',
            'email',
            'data_nascimento',
            'signo',
            'foto_url',
            'tags',
            'observacoes_alergias',
            'preferencias_sensoriais',
            'total_investido',
            'visitas_realizadas',
            'ultima_visita',
            'criado_em',
            'atualizado_em',
        ]


class ClienteDetailSerializer(serializers.ModelSerializer):
    formulas = FormulaQuimicaSerializer(many=True, read_only=True)

    class Meta:
        model = Cliente
        fields = [
            'id',
            'nome',
            'telefone',
            'email',
            'data_nascimento',
            'signo',
            'foto_url',
            'tags',
            'observacoes_alergias',
            'preferencias_sensoriais',
            'total_investido',
            'visitas_realizadas',
            'ultima_visita',
            'formulas',
            'criado_em',
            'atualizado_em',
        ]
