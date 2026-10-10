import secrets
import string
from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from apps.usuarios.models import Usuario
from apps.servicos.serializers import ServicoSerializer
from .models import Profissional


class ProfissionalSerializer(serializers.ModelSerializer):
    servicos_detalhes = ServicoSerializer(source='servicos', many=True, read_only=True)
    email_usuario = serializers.EmailField(source='usuario.email', read_only=True)
    possui_acesso = serializers.SerializerMethodField()

    class Meta:
        model = Profissional
        fields = [
            'id',
            'nome',
            'cargo',
            'cadeira',
            'cor_hex',
            'foto_url',
            'horario_inicio',
            'horario_fim',
            'dias_semana',
            'servicos',
            'servicos_detalhes',
            'ativo',
            'usuario',
            'email_usuario',
            'possui_acesso',
            'criado_em',
            'atualizado_em',
        ]

    def get_possui_acesso(self, obj):
        return obj.usuario is not None


class CriarAcessoProfissionalSerializer(serializers.Serializer):
    email = serializers.EmailField()
    perfil = serializers.ChoiceField(choices=['admin', 'profissional'], default='profissional')
