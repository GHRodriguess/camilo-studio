from rest_framework.routers import DefaultRouter
from .views import ProfissionalViewSet

router = DefaultRouter()
router.register(r'profissionais', ProfissionalViewSet, basename='profissionais')

urlpatterns = router.urls
