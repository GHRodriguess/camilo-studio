from rest_framework.routers import DefaultRouter
from .views import FormulaQuimicaViewSet

router = DefaultRouter()
router.register(r'formulas', FormulaQuimicaViewSet, basename='formulas')

urlpatterns = router.urls
