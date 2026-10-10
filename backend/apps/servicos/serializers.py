from rest_framework import serializers
from .models import Servico


class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = [
            'id',
            'nome',
            'categoria',
            'descricao',
            'duracao_minutos',
            'preco',
            'ativo',
            'criado_em',
            'atualizado_em',
        ]
