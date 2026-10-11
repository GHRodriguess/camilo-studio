from camilo_core.routers import OptionalSlashRouter
from .views import ProfissionalViewSet

router = OptionalSlashRouter()
router.register(r'profissionais', ProfissionalViewSet, basename='profissionais')

urlpatterns = router.urls
