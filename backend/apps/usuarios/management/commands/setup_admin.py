from django.core.management.base import BaseCommand
from apps.usuarios.models import Usuario


class Command(BaseCommand):
    help = 'Cria o usuário administrador inicial para o Camilo Studio'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@camilostudio.com')
        parser.add_argument('--password', type=str, default='admin123')
        parser.add_argument('--nome', type=str, default='Gabriel Camilo')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        nome = options['nome']

        user, created = Usuario.objects.get_or_create(
            email=email,
            defaults={
                'nome': nome,
                'perfil': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'deve_redefinir_senha': False,
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Administrador "{email}" criado com sucesso! Senha: "{password}"'))
        else:
            user.set_password(password)
            user.perfil = 'admin'
            user.is_staff = True
            user.is_superuser = True
            user.deve_redefinir_senha = False
            user.save()
            self.stdout.write(self.style.WARNING(f'Administrador "{email}" já existia. Senha redefinida para: "{password}"'))
