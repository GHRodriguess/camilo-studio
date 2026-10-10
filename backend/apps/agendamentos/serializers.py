import urllib.parse
from rest_framework import serializers
from .models import Agendamento
from apps.clientes.serializers import ClienteSerializer
from apps.equipe.serializers import ProfissionalSerializer
from apps.servicos.serializers import ServicoSerializer
from apps.servicos.models import Servico
from apps.notificacoes.models import ConfiguracaoAtelie, NotificacaoWhatsApp


class AgendamentoSerializer(serializers.ModelSerializer):
    cliente_detalhes = ClienteSerializer(source='cliente', read_only=True)
    profissional_detalhes = ProfissionalSerializer(source='profissional', read_only=True)
    servicos_detalhes = ServicoSerializer(source='servicos', many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Agendamento
        fields = [
            'id',
            'cliente',
            'cliente_detalhes',
            'profissional',
            'profissional_detalhes',
            'servicos',
            'servicos_detalhes',
            'data_hora_inicio',
            'data_hora_fim',
            'status',
            'status_display',
            'valor_total',
            'observacoes',
            'criado_em',
            'atualizado_em',
        ]

    def create(self, validated_data):
        servicos = validated_data.pop('servicos', [])
        agendamento = Agendamento.objects.create(**validated_data)
        if servicos:
            agendamento.servicos.set(servicos)
            # Calcula valor total se não informado
            if not agendamento.valor_total or agendamento.valor_total == 0:
                total = sum(s.preco for s in servicos)
                agendamento.valor_total = total
                agendamento.save()
        return agendamento
