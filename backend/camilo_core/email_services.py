import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from camilo_core.email_templates import (
    base_email_html,
    template_codigo_recuperacao,
    template_novo_acesso_equipe,
    template_reset_senha_admin,
)

logger = logging.getLogger(__name__)


def _send_mail(assunto: str, texto_puro: str, html: str, email_destino: str) -> bool:
    try:
        msg = EmailMultiAlternatives(
            subject=assunto,
            body=texto_puro,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email_destino],
        )
        msg.attach_alternative(html, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail para {email_destino}: {e}")
        return False


def enviar_email_codigo_recuperacao(nome: str, email_destino: str, codigo: str) -> bool:
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    link_recuperacao = f"{frontend_url}/esqueci-senha"
    assunto = f"Código de Recuperação: {codigo} — Camilo Studio"
    texto_puro = (
        f"Olá, {nome}!\n\n"
        f"Recebemos uma solicitação de redefinição de senha para a sua conta no Camilo Studio.\n\n"
        f"Seu código de verificação é: {codigo}\n\n"
        f"Este código é válido por 15 minutos.\n"
        f"Para redefinir, acesse: {link_recuperacao}\n\n"
        f"Se você não solicitou esta alteração, ignore esta mensagem com segurança."
    )
    conteudo = template_codigo_recuperacao(nome, codigo, link_recuperacao)
    html = base_email_html("Recuperação de Senha — Camilo Studio", conteudo)
    return _send_mail(assunto, texto_puro, html, email_destino)


def enviar_email_novo_acesso_equipe(nome: str, email_destino: str, senha_temp: str) -> bool:
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    link_login = f"{frontend_url}/login"
    assunto = "Bem-vindo(a) à equipe do Camilo Studio — Seu Acesso"
    texto_puro = (
        f"Olá, {nome}!\n\n"
        f"Seu acesso à plataforma do Camilo Studio foi criado com sucesso.\n"
        f"Acesse o sistema com suas credenciais provisórias:\n\n"
        f"E-mail: {email_destino}\n"
        f"Senha Provisória: {senha_temp}\n\n"
        f"Acesse em: {link_login}\n\n"
        f"No primeiro acesso, você será solicitado(a) a criar uma nova senha definitiva e pessoal."
    )
    conteudo = template_novo_acesso_equipe(nome, email_destino, senha_temp, link_login)
    html = base_email_html("Seu Acesso — Camilo Studio", conteudo)
    return _send_mail(assunto, texto_puro, html, email_destino)


def enviar_email_reset_senha_admin(nome: str, email_destino: str, nova_senha_temp: str) -> bool:
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    link_login = f"{frontend_url}/login"
    assunto = "Redefinição de Acesso — Camilo Studio"
    texto_puro = (
        f"Olá, {nome}!\n\n"
        f"Uma nova senha provisória foi gerada pelo administrador do Camilo Studio:\n\n"
        f"E-mail: {email_destino}\n"
        f"Nova Senha Provisória: {nova_senha_temp}\n\n"
        f"Acesse em: {link_login}\n\n"
        f"Ao entrar, você deverá cadastrar sua nova senha definitiva."
    )
    conteudo = template_reset_senha_admin(nome, email_destino, nova_senha_temp, link_login)
    html = base_email_html("Redefinição de Acesso — Camilo Studio", conteudo)
    return _send_mail(assunto, texto_puro, html, email_destino)
