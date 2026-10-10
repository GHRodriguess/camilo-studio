from rest_framework.routers import DefaultRouter
from .views import ServicoViewSet

router = DefaultRouter()
router.register(r'servicos', ServicoViewSet, basename='servicos')

urlpatterns = router.urls
