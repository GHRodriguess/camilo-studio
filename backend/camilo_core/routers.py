from rest_framework.routers import DefaultRouter

class OptionalSlashRouter(DefaultRouter):
    """
    Router que aceita URLs com ou sem barra final (trailing slash).
    Isso previne problemas de redirecionamento em proxies (como Next.js rewrites) e chamadas POST/PUT.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trailing_slash = r'/?'
