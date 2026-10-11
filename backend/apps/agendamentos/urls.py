from camilo_core.routers import OptionalSlashRouter
from .views import AgendamentoViewSet

router = OptionalSlashRouter()
router.register(r'agendamentos', AgendamentoViewSet, basename='agendamentos')

urlpatterns = router.urls
