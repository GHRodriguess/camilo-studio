from datetime import datetime, timedelta, time
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.usuarios.models import Usuario
from apps.servicos.models import Servico
from apps.equipe.models import Profissional
from apps.clientes.models import Cliente
from apps.formulas.models import FormulaQuimica
from apps.agendamentos.models import Agendamento
from apps.notificacoes.models import ConfiguracaoAtelie, NotificacaoWhatsApp


class Command(BaseCommand):
    help = 'Popula o banco de dados com dados realistas do Stitch e do Camilo Studio'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando povoamento de dados...')

        # 1. Configuração do Ateliê
        config = ConfiguracaoAtelie.get_solo()
        config.nome_atelie = 'Camilo Studio'
        config.slogan = 'Haute Coiffure & Estética Avançada'
        config.telefone = '+55 11 98765-4321'
        config.email = 'contato@camilostudio.com'
        config.endereco = 'Rua Oscar Freire, 1200 - Jardins, São Paulo - SP'
        config.horario_funcionamento = 'Terça a Sábado, das 09h às 20h'
        config.save()
        self.stdout.write(self.style.SUCCESS('✓ Configuração do Ateliê atualizada.'))

        # 2. Usuários e Equipe
        admin_user, _ = Usuario.objects.get_or_create(
            email='admin@camilostudio.com',
            defaults={
                'nome': 'Gabriel Camilo',
                'perfil': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'deve_redefinir_senha': False,
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        equipe_dados = [
            {
                'email': 'admin@camilostudio.com',
                'usuario': admin_user,
                'nome': 'Gabriel Camilo',
                'cargo': 'Hair Stylist & Colorista Master',
                'cor_hex': '#7C3AED',
                'foto_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            },
            {
                'email': 'mariana@camilostudio.com',
                'nome': 'Mariana Rios',
                'cargo': 'Especialista em Mechas & Balayage',
                'cor_hex': '#9E41F5',
                'foto_url': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
            },
            {
                'email': 'lucas@camilostudio.com',
                'nome': 'Lucas Silveira',
                'cargo': 'Master Stylist & Cortes de Precisão',
                'cor_hex': '#831ADA',
                'foto_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            },
            {
                'email': 'beatriz@camilostudio.com',
                'nome': 'Beatriz Costa',
                'cargo': 'Terapeuta Capilar & Cuidados Holísticos',
                'cor_hex': '#5F34A8',
                'foto_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            },
        ]

        profissionais_map = {}
        for ed in equipe_dados:
            user = ed.get('usuario')
            if not user:
                user, _ = Usuario.objects.get_or_create(
                    email=ed['email'],
                    defaults={'nome': ed['nome'], 'perfil': 'profissional', 'deve_redefinir_senha': False}
                )
                user.set_password('senha123')
                user.save()

            prof, _ = Profissional.objects.get_or_create(
                nome=ed['nome'],
                defaults={
                    'usuario': user,
                    'cargo': ed['cargo'],
                    'cor_hex': ed['cor_hex'],
                    'foto_url': ed['foto_url'],
                    'ativo': True,
                }
            )
            profissionais_map[prof.nome] = prof

        self.stdout.write(self.style.SUCCESS(f'✓ {len(profissionais_map)} profissionais cadastrados.'))

        # 3. Serviços
        servicos_dados = [
            {'nome': 'Mechas Globais Iluminadas', 'categoria': 'Mechas', 'duracao_minutos': 240, 'preco': 780.00, 'descricao': 'Clareamento global com preservação total da fibra capilar e tonalização personalizada.'},
            {'nome': 'Morena Iluminada Avelã', 'categoria': 'Mechas', 'duracao_minutos': 210, 'preco': 690.00, 'descricao': 'Técnica de contorno suave com transição perfeita em tons quentes de avelã e caramelo.'},
            {'nome': 'Tonalização & Gloss Amethyst', 'categoria': 'Mechas', 'duracao_minutos': 60, 'preco': 260.00, 'descricao': 'Realce de cor, anulação de amarelados e brilho espelhado luminoso.'},
            {'nome': 'Corte Editorial Camilo', 'categoria': 'Cabelo', 'duracao_minutos': 60, 'preco': 280.00, 'descricao': 'Visagismo e corte personalizado com finalização e lavagem sensorial.'},
            {'nome': 'Corte Bordado & Selagem de Pontas', 'categoria': 'Cabelo', 'duracao_minutos': 75, 'preco': 320.00, 'descricao': 'Remoção de pontas duplas sem perder comprimento, aliada a nano-nutrição.'},
            {'nome': 'Terapia Capilar Regenerativa', 'categoria': 'Tratamento', 'duracao_minutos': 90, 'preco': 420.00, 'descricao': 'Desintoxicação do couro cabeludo com laser terapia e reposição lipídica profunda.'},
            {'nome': 'Cronograma Nutritivo Violet', 'categoria': 'Tratamento', 'duracao_minutos': 60, 'preco': 290.00, 'descricao': 'Tratamento intensivo de 3 fases para cabelos descoloridos ou sensibilizados.'},
            {'nome': 'Escova Glamour Ondulada', 'categoria': 'Penteado', 'duracao_minutos': 45, 'preco': 160.00, 'descricao': 'Modelagem com ondas naturais e fixação de alta durabilidade com toque sedoso.'},
            {'nome': 'Design de Sobrancelhas Couture', 'categoria': 'Estética', 'duracao_minutos': 45, 'preco': 140.00, 'descricao': 'Alinhamento anatômico com pinça e acabamento com tintura de henna mineral.'},
        ]

        servicos_map = {}
        for sd in servicos_dados:
            s, _ = Servico.objects.get_or_create(
                nome=sd['nome'],
                defaults=sd
            )
            servicos_map[s.nome] = s

        # Vincular serviços a profissionais
        for prof in Profissional.objects.all():
            prof.servicos.set(Servico.objects.all())

        self.stdout.write(self.style.SUCCESS(f'✓ {len(servicos_map)} serviços cadastrados.'))

        # 4. Clientes
        clientes_dados = [
            {
                'nome': 'Helena Brandão',
                'telefone': '(11) 99876-5432',
                'email': 'helena.brandao@email.com',
                'signo': 'Leão',
                'tags': 'VIP, Loiros, Frequente',
                'total_investido': 3820.00,
                'visitas_realizadas': 5,
                'observacoes_alergias': 'Sem alergias conhecidas. Couro cabeludo ligeiramente sensível a pó descolorante com amônia forte.',
                'preferencias_sensoriais': 'Café espresso duplo sem açúcar com raspas de limão; água com gás; temperatura do lavatório morna.',
                'foto_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
            },
            {
                'nome': 'Camila Siqueira',
                'telefone': '(11) 98765-1122',
                'email': 'camila.siqueira@email.com',
                'signo': 'Touro',
                'tags': 'Frequente, Morena Iluminada',
                'total_investido': 2450.00,
                'visitas_realizadas': 4,
                'observacoes_alergias': 'Sensibilidade a fragrâncias florais muito intensas.',
                'preferencias_sensoriais': 'Chá de camomila com mel; revista de decoração ou moda; prefere atendimento silencioso.',
                'foto_url': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            },
            {
                'nome': 'Valentina Rossi',
                'telefone': '(11) 97654-9988',
                'email': 'valentina.rossi@email.com',
                'signo': 'Escorpião',
                'tags': 'VIP, Tratamentos, Corte',
                'total_investido': 4200.00,
                'visitas_realizadas': 6,
                'observacoes_alergias': 'Alergia a parabenos e derivados de sulfatos pesados.',
                'preferencias_sensoriais': 'Cappuccino com leite vegetal; água aromatizada com hortelã; playlists calmas.',
                'foto_url': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
            },
            {
                'nome': 'Sofia Alencar',
                'telefone': '(11) 98123-4567',
                'email': 'sofia.alencar@email.com',
                'signo': 'Gêmeos',
                'tags': 'Frequente, Cabelo',
                'total_investido': 1950.00,
                'visitas_realizadas': 3,
                'observacoes_alergias': 'Nenhuma alergia relatada.',
                'preferencias_sensoriais': 'Água sem gás natural; conversa animada sobre viagens e tendências.',
                'foto_url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
            },
            {
                'nome': 'Beatriz Nogueira',
                'telefone': '(11) 99345-6789',
                'email': 'beatriz.nogueira@email.com',
                'signo': 'Câncer',
                'tags': 'Nova Cliente',
                'total_investido': 780.00,
                'visitas_realizadas': 1,
                'observacoes_alergias': 'Cabelo fino com histórico de progressiva ácida há 8 meses.',
                'preferencias_sensoriais': 'Café suave com adoçante; tolera bem massagem capilar.',
                'foto_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            },
        ]

        clientes_map = {}
        for cd in clientes_dados:
            c, _ = Cliente.objects.get_or_create(
                nome=cd['nome'],
                defaults=cd
            )
            clientes_map[c.nome] = c

        self.stdout.write(self.style.SUCCESS(f'✓ {len(clientes_map)} clientes cadastradas.'))

        # 5. Fórmulas Químicas
        helena = clientes_map['Helena Brandão']
        gabriel = profissionais_map['Gabriel Camilo']
        mariana = profissionais_map['Mariana Rios']

        FormulaQuimica.objects.get_or_create(
            cliente=helena,
            procedimento='Mechas Globais Pérola Couture',
            defaults={
                'profissional': gabriel,
                'data_aplicacao': timezone.now().date() - timedelta(days=45),
                'formula_texto': 'Pó Descolorante Blondme (45g) + OX 20 vol (90g)\nTonalização: Igora Vibrance 9.5-1 (30g) + 9.5-49 (10g) com Gel Ativador 1.9% (80g)',
                'volumagem_ox': '20 vol',
                'tempo_pausa_minutos': 48,
                'fundo_clareamento': 'Fundo 10 limpo e uniforme',
                'observacoes': 'Fibra reagiu com estabilidade perfeita. Uso obrigatório de Fibreplex Passo 1 na mistura e Passo 2 no lavatório.',
            }
        )

        FormulaQuimica.objects.get_or_create(
            cliente=helena,
            procedimento='Retoque de Raiz & Gloss Violet',
            defaults={
                'profissional': gabriel,
                'data_aplicacao': timezone.now().date() - timedelta(days=120),
                'formula_texto': 'Blondme 35g + OX 20 vol 70g. Tonalizante Dialight 9.02 (40g) + Revelador 9 vol (60g)',
                'volumagem_ox': '20 vol',
                'tempo_pausa_minutos': 42,
                'fundo_clareamento': 'Fundo 9.5',
                'observacoes': 'Resultado perolado frio acetinado.',
            }
        )

        camila = clientes_map['Camila Siqueira']
        FormulaQuimica.objects.get_or_create(
            cliente=camila,
            procedimento='Morena Iluminada Avelã & Caramelo',
            defaults={
                'profissional': mariana,
                'data_aplicacao': timezone.now().date() - timedelta(days=60),
                'formula_texto': 'Igora Vario Blond Plus (40g) + OX 30 vol (80g)\nEsfumado: 5-0 (20g) + 6-12 (20g)\nTonalização pontas: 7-57 (30g) + 8-46 (15g)',
                'volumagem_ox': '30 vol',
                'tempo_pausa_minutos': 35,
                'fundo_clareamento': 'Fundo 7/8 acobreado suave',
                'observacoes': 'Transição ultra-suave sem marcação de raiz.',
            }
        )
        self.stdout.write(self.style.SUCCESS('✓ Fórmulas químicas criadas com sucesso.'))

        # 6. Agendamentos
        hoje = timezone.now().date()
        agendamentos_dados = [
            {
                'cliente': helena,
                'profissional': gabriel,
                'servico': servicos_map['Mechas Globais Iluminadas'],
                'data_hora_inicio': timezone.make_aware(datetime.combine(hoje, time(9, 30))),
                'data_hora_fim': timezone.make_aware(datetime.combine(hoje, time(13, 30))),
                'status': 'confirmado',
                'observacoes': 'Cliente solicitou conferir a fórmula da última visita antes de iniciar.',
            },
            {
                'cliente': camila,
                'profissional': mariana,
                'servico': servicos_map['Morena Iluminada Avelã'],
                'data_hora_inicio': timezone.make_aware(datetime.combine(hoje, time(14, 0))),
                'data_hora_fim': timezone.make_aware(datetime.combine(hoje, time(17, 30))),
                'status': 'agendado',
                'observacoes': 'Confirmar envio de lembrete pelo WhatsApp pela manhã.',
            },
            {
                'cliente': clientes_map['Valentina Rossi'],
                'profissional': profissionais_map['Lucas Silveira'],
                'servico': servicos_map['Corte Editorial Camilo'],
                'data_hora_inicio': timezone.make_aware(datetime.combine(hoje, time(16, 30))),
                'data_hora_fim': timezone.make_aware(datetime.combine(hoje, time(17, 30))),
                'status': 'confirmado',
                'observacoes': 'Corte pontas e alinhamento visagista.',
            },
            {
                'cliente': clientes_map['Sofia Alencar'],
                'profissional': profissionais_map['Beatriz Costa'],
                'servico': servicos_map['Terapia Capilar Regenerativa'],
                'data_hora_inicio': timezone.make_aware(datetime.combine(hoje, time(18, 0))),
                'data_hora_fim': timezone.make_aware(datetime.combine(hoje, time(19, 30))),
                'status': 'em_atendimento',
                'observacoes': 'Sessão 2 do cronograma regenerativo.',
            },
            {
                'cliente': clientes_map['Beatriz Nogueira'],
                'profissional': gabriel,
                'servico': servicos_map['Cronograma Nutritivo Violet'],
                'data_hora_inicio': timezone.make_aware(datetime.combine(hoje + timedelta(days=1), time(10, 0))),
                'data_hora_fim': timezone.make_aware(datetime.combine(hoje + timedelta(days=1), time(11, 0))),
                'status': 'agendado',
                'observacoes': 'Avaliação de mecha teste prévia.',
            },
        ]

        for ad in agendamentos_dados:
            serv = ad.pop('servico')
            ag, created = Agendamento.objects.get_or_create(
                cliente=ad['cliente'],
                data_hora_inicio=ad['data_hora_inicio'],
                defaults=ad
            )
            if created:
                ag.servicos.add(serv)
                ag.valor_total = serv.preco
                ag.save()

        self.stdout.write(self.style.SUCCESS('✓ Agendamentos do dia e próximos criados com sucesso.'))
        self.stdout.write(self.style.SUCCESS('\nBase de dados populada com êxito para o Camilo Studio! ✨'))
