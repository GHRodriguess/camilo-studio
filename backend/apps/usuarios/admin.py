from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    list_display = ('email', 'nome', 'perfil', 'deve_redefinir_senha', 'is_staff', 'is_active')
    list_filter = ('perfil', 'deve_redefinir_senha', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('nome', 'telefone', 'perfil')}),
        ('Permissões & Acesso', {'fields': ('deve_redefinir_senha', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas', {'fields': ('last_login', 'criado_em', 'atualizado_em')}),
    )
    readonly_fields = ('criado_em', 'atualizado_em', 'last_login')
    search_fields = ('email', 'nome', 'telefone')
    ordering = ('email',)
