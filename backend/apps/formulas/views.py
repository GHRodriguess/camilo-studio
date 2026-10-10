from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import FormulaQuimica
from .serializers import FormulaQuimicaSerializer


class FormulaQuimicaViewSet(viewsets.ModelViewSet):
    queryset = FormulaQuimica.objects.all().select_related('cliente', 'profissional')
    serializer_class = FormulaQuimicaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cliente', 'profissional', 'volumagem_ox']
    search_fields = ['procedimento', 'formula_texto', 'observacoes', 'cliente__nome']
    ordering_fields = ['data_aplicacao', 'criado_em']
    ordering = ['-data_aplicacao']
