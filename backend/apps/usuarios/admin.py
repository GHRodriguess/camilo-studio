from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario, CodigoRedefinicaoSenha


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


@admin.register(CodigoRedefinicaoSenha)
class CodigoRedefinicaoSenhaAdmin(admin.ModelAdmin):
    list_display = ('email', 'codigo', 'criado_em', 'utilizado')
    list_filter = ('utilizado', 'criado_em')
    search_fields = ('email', 'codigo')
    readonly_fields = ('email', 'codigo', 'criado_em')
