import datetime
import urllib.parse
from django.utils import timezone
from rest_framework import serializers
from .models import Agendamento
from apps.clientes.serializers import ClienteSerializer
from apps.equipe.models import Profissional
from apps.equipe.serializers import ProfissionalSerializer
from apps.servicos.serializers import ServicoSerializer
from apps.servicos.models import Servico
from apps.notificacoes.models import ConfiguracaoAtelie, NotificacaoWhatsApp


class AgendamentoSerializer(serializers.ModelSerializer):
    cliente_detalhes = ClienteSerializer(source='cliente', read_only=True)
    profissional = serializers.PrimaryKeyRelatedField(queryset=Profissional.objects.all(), required=False, allow_null=True)
    profissional_detalhes = ProfissionalSerializer(source='profissional', read_only=True)
    servicos_detalhes = ServicoSerializer(source='servicos', many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    indicador_temporal = serializers.CharField(read_only=True)
    tempo_relativo_display = serializers.CharField(read_only=True)

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
            'indicador_temporal',
            'tempo_relativo_display',
            'valor_total',
            'observacoes',
            'criado_em',
            'atualizado_em',
        ]

    def validate(self, attrs):
        inicio = attrs.get('data_hora_inicio')
        fim = attrs.get('data_hora_fim')

        if self.instance:
            if inicio and not fim:
                duracao = self.instance.data_hora_fim - self.instance.data_hora_inicio
                fim = inicio + duracao
                attrs['data_hora_fim'] = fim
            elif not inicio:
                inicio = self.instance.data_hora_inicio
            if not fim:
                fim = self.instance.data_hora_fim

        if inicio and fim and fim <= inicio:
            raise serializers.ValidationError({
                'data_hora_fim': 'O horário de término deve ser posterior ao horário de início.'
            })

        agora_tolerancia = timezone.now() - datetime.timedelta(minutes=5)

        # Regra inviolável: não agendar no passado
        if not self.instance:
            if inicio and inicio < agora_tolerancia:
                raise serializers.ValidationError({
                    'data_hora_inicio': 'Não é permitido criar um agendamento anterior ao horário atual.'
                })
        else:
            # Se for edição e estiver mudando o horário de início
            if 'data_hora_inicio' in attrs and inicio < agora_tolerancia:
                raise serializers.ValidationError({
                    'data_hora_inicio': 'Não é permitido reagendar para um horário anterior ao momento atual.'
                })

        return attrs

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

    def update(self, instance, validated_data):
        servicos = validated_data.pop('servicos', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if servicos is not None:
            instance.servicos.set(servicos)
            if 'valor_total' not in self.initial_data:
                total = sum(s.preco for s in servicos)
                instance.valor_total = total
                instance.save()
        return instance
