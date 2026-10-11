from camilo_core.routers import OptionalSlashRouter
from .views import ServicoViewSet

router = OptionalSlashRouter()
router.register(r'servicos', ServicoViewSet, basename='servicos')

urlpatterns = router.urls
