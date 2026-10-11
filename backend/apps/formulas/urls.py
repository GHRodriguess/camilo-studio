from camilo_core.routers import OptionalSlashRouter
from .views import FormulaQuimicaViewSet

router = OptionalSlashRouter()
router.register(r'formulas', FormulaQuimicaViewSet, basename='formulas')

urlpatterns = router.urls
