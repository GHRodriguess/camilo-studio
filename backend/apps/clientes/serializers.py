import re
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

    def validate_telefone(self, value):
        digits = re.sub(r'\D', '', value)
        if len(digits) not in [10, 11]:
            raise serializers.ValidationError('O telefone deve conter DDD + número com 10 ou 11 dígitos no formato (xx) xxxxx-xxxx.')
        ddd = int(digits[:2])
        if ddd < 11 or ddd > 99:
            raise serializers.ValidationError('DDD inválido. Informe um DDD brasileiro válido entre 11 e 99.')
        if len(digits) == 11 and digits[2] != '9':
            raise serializers.ValidationError('Celular inválido. O número com 11 dígitos deve iniciar com 9 após o DDD.')
        if len(digits) == 11:
            return f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
        return f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"


class ClienteDetailSerializer(ClienteSerializer):
    formulas = FormulaQuimicaSerializer(many=True, read_only=True)

    class Meta(ClienteSerializer.Meta):
        fields = ClienteSerializer.Meta.fields + ['formulas']
