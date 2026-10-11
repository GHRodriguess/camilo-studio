from django.urls import path, re_path, include
from camilo_core.routers import OptionalSlashRouter
from .views import (
    LoginView,
    LogoutView,
    MeView,
    RedefinirSenhaPrimeiroAcessoView,
    EsqueciSenhaView,
    ConfirmarRedefinicaoSenhaView,
    UsuarioViewSet,
)

router = OptionalSlashRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    re_path(r'^auth/login/?$', LoginView.as_view(), name='auth-login'),
    re_path(r'^auth/logout/?$', LogoutView.as_view(), name='auth-logout'),
    re_path(r'^auth/me/?$', MeView.as_view(), name='auth-me'),
    re_path(r'^auth/redefinir-senha/?$', RedefinirSenhaPrimeiroAcessoView.as_view(), name='auth-redefinir-senha'),
    re_path(r'^auth/esqueci-senha/?$', EsqueciSenhaView.as_view(), name='auth-esqueci-senha'),
    re_path(r'^auth/confirmar-redefinicao/?$', ConfirmarRedefinicaoSenhaView.as_view(), name='auth-confirmar-redefinicao'),
    path('', include(router.urls)),
]
