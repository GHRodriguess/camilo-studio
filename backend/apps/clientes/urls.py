from camilo_core.routers import OptionalSlashRouter
from .views import ClienteViewSet

router = OptionalSlashRouter()
router.register(r'clientes', ClienteViewSet, basename='clientes')

urlpatterns = router.urls
