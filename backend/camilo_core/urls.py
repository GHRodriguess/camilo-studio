from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.usuarios.urls')),
    path('api/', include('apps.servicos.urls')),
    path('api/', include('apps.equipe.urls')),
    path('api/', include('apps.clientes.urls')),
    path('api/', include('apps.formulas.urls')),
    path('api/', include('apps.agendamentos.urls')),
    path('api/', include('apps.notificacoes.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
