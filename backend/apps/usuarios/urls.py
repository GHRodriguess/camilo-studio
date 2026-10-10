from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    LogoutView,
    MeView,
    RedefinirSenhaPrimeiroAcessoView,
    EsqueciSenhaView,
    ConfirmarRedefinicaoSenhaView,
    UsuarioViewSet,
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/redefinir-senha/', RedefinirSenhaPrimeiroAcessoView.as_view(), name='auth-redefinir-senha'),
    path('auth/esqueci-senha/', EsqueciSenhaView.as_view(), name='auth-esqueci-senha'),
    path('auth/confirmar-redefinicao/', ConfirmarRedefinicaoSenhaView.as_view(), name='auth-confirmar-redefinicao'),
    path('', include(router.urls)),
]
