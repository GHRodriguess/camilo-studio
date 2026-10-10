from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Cliente
from .serializers import ClienteSerializer, ClienteDetailSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().prefetch_related('formulas')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'telefone', 'email', 'tags', 'observacoes_alergias']
    ordering_fields = ['nome', 'total_investido', 'visitas_realizadas', 'ultima_visita', 'criado_em']
    ordering = ['nome']

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return ClienteDetailSerializer
        return ClienteSerializer
