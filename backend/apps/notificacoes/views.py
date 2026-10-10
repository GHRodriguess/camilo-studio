from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from .models import NotificacaoWhatsApp, ConfiguracaoAtelie
from .serializers import NotificacaoWhatsAppSerializer, ConfiguracaoAtelieSerializer


class NotificacaoWhatsAppViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NotificacaoWhatsApp.objects.all().select_related('cliente', 'agendamento')
    serializer_class = NotificacaoWhatsAppSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-criado_em']


class ConfiguracaoAtelieView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        config = ConfiguracaoAtelie.get_solo()
        serializer = ConfiguracaoAtelieSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        config = ConfiguracaoAtelie.get_solo()
        serializer = ConfiguracaoAtelieSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
