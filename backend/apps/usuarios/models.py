from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O e-mail é obrigatório.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('perfil', 'admin')
        extra_fields.setdefault('deve_redefinir_senha', False)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superusuário deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superusuário deve ter is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    PERFIL_CHOICES = (
        ('admin', 'Administrador'),
        ('profissional', 'Profissional'),
    )

    email = models.EmailField('E-mail', unique=True, max_length=255)
    nome = models.CharField('Nome Completo', max_length=255)
    perfil = models.CharField('Perfil de Acesso', max_length=20, choices=PERFIL_CHOICES, default='profissional')
    deve_redefinir_senha = models.BooleanField('Deve Redefinir Senha no 1º Acesso', default=False)
    telefone = models.CharField('Telefone / WhatsApp', max_length=20, blank=True, default='')

    is_active = models.BooleanField('Ativo', default=True)
    is_staff = models.BooleanField('Equipe / Acesso Admin', default=False)
    criado_em = models.DateTimeField('Criado em', auto_now_add=True)
    atualizado_em = models.DateTimeField('Atualizado em', auto_now=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.email})"
