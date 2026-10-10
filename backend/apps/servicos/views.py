from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Servico
from .serializers import ServicoSerializer


class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'ativo']
    search_fields = ['nome', 'descricao', 'categoria']
    ordering_fields = ['nome', 'preco', 'duracao_minutos', 'criado_em']
    ordering = ['categoria', 'nome']
