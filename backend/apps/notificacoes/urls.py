from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificacaoWhatsAppViewSet, ConfiguracaoAtelieView

router = DefaultRouter()
router.register(r'notificacoes', NotificacaoWhatsAppViewSet, basename='notificacoes')

urlpatterns = [
    path('configuracoes/', ConfiguracaoAtelieView.as_view(), name='configuracoes-atelie'),
    path('', include(router.urls)),
]
