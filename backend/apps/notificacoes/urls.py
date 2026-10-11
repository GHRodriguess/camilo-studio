from django.urls import path, re_path, include
from camilo_core.routers import OptionalSlashRouter
from .views import NotificacaoWhatsAppViewSet, ConfiguracaoAtelieView

router = OptionalSlashRouter()
router.register(r'notificacoes', NotificacaoWhatsAppViewSet, basename='notificacoes')

urlpatterns = [
    re_path(r'^configuracoes/?$', ConfiguracaoAtelieView.as_view(), name='configuracoes-atelie'),
    path('', include(router.urls)),
]
