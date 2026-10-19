import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)


def _base_email_html(titulo_cabecalho: str, conteudo_html: str) -> str:
    """
    Template base HTML editorial no estilo Violet Luminary do Camilo Studio.
    Compatível com clientes móveis, web e dark mode (Gmail, Apple Mail, Outlook).
    """
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{titulo_cabecalho}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #221B2D; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8F5FC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #ECE3F6; box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.06);">
          
          <!-- Faixa Superior Violeta -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #7C3AED 0%, #9E41F5 50%, #5F34A8 100%); background-color: #7C3AED;"></td>
          </tr>

          <!-- Cabeçalho Institucional -->
          <tr>
            <td align="center" style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #F3EDFA;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 21px; font-weight: 800; letter-spacing: 3.5px; color: #1E1233; text-transform: uppercase;">
                      CAMILO STUDIO
                    </div>
                    <div style="font-size: 10px; font-weight: 600; letter-spacing: 2px; color: #7C3AED; text-transform: uppercase; margin-top: 4px;">
                      Haute Coiffure &amp; Estética Avançada
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 32px;">
              {conteudo_html}
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #FAF7FD; padding: 24px 32px; border-top: 1px solid #F1E9F8; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #857B94; line-height: 1.6;">
                <strong>Camilo Studio</strong> &bull; Sistema de Gestão &amp; Atendimento<br>
                Rua Oscar Freire, 1200 - Jardins, São Paulo - SP
              </p>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #ACA3BA;">
                Este é um e-mail automático e confidencial do ateliê.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def enviar_email_codigo_recuperacao(nome: str, email_destino: str, codigo: str) -> bool:
    """
    Envia o e-mail de recuperação de senha com o código de 6 dígitos em grande destaque visual.
    """
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

    conteudo_html = f"""
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #1E1233;">
        Olá, {nome}!
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 13.5px; line-height: 1.6; color: #524763;">
        Recebemos uma solicitação para redefinir a senha de acesso da sua conta no <strong>Camilo Studio</strong>. Utilize o código de uso único abaixo para prosseguir:
      </p>

      <!-- Card do Código em Destaque Visual -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F6F0FD; border: 1px solid #DCC9F7; border-radius: 18px; margin-bottom: 24px;">
        <tr>
          <td align="center" style="padding: 24px 16px;">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #7C3AED; text-transform: uppercase; margin-bottom: 8px;">
              CÓDIGO DE VERIFICAÇÃO
            </div>
            <div style="font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #5B21B6; margin: 4px 0 10px 0;">
              {codigo}
            </div>
            <span style="display: inline-block; background-color: #EDE9FE; color: #6D28D9; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 9999px;">
              ⏱️ Válido por 15 minutos
            </span>
          </td>
        </tr>
      </table>

      <!-- Botão CTA -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
        <tr>
          <td align="center">
            <a href="{link_recuperacao}" target="_blank" style="display: inline-block; background-color: #7C3AED; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.28);">
              Redefinir Minha Senha no Sistema &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin: 0; font-size: 11.5px; line-height: 1.5; color: #857B94; text-align: center;">
        Se você não solicitou a troca de senha, pode desconsiderar este e-mail tranquilamente. Sua conta continua 100% segura.
      </p>
    """

    html = _base_email_html("Recuperação de Senha — Camilo Studio", conteudo_html)

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
        logger.error(f"Erro ao enviar e-mail de recuperação para {email_destino}: {e}")
        return False


def enviar_email_novo_acesso_equipe(nome: str, email_destino: str, senha_temp: str) -> bool:
    """
    Envia o e-mail de boas-vindas para novo membro da equipe com credenciais provisórias e botão CTA para o app.
    """
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

    conteudo_html = f"""
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #1E1233;">
        Olá, {nome}!
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 13.5px; line-height: 1.6; color: #524763;">
        Seu acesso à plataforma de gestão do <strong>Camilo Studio</strong> foi configurado com sucesso. Você agora tem acesso à sua agenda, ficha técnica de clientes e catálogo de serviços.
      </p>

      <!-- Card de Credenciais Provisórias -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F6F0FD; border: 1px solid #DCC9F7; border-radius: 18px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 22px;">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #7C3AED; text-transform: uppercase; margin-bottom: 14px;">
              Suas Credenciais de Primeiro Acesso
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 10px;">
              <tr>
                <td width="30%" style="font-size: 12px; color: #766B87; font-weight: 500;">E-mail:</td>
                <td width="70%" style="font-size: 12.5px; font-weight: 600; color: #1E1233; font-family: 'SF Mono', Monaco, monospace;">
                  {email_destino}
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="30%" style="font-size: 12px; color: #766B87; font-weight: 500;">Senha Provisória:</td>
                <td width="70%">
                  <span style="display: inline-block; background-color: #FFFFFF; border: 1px solid #D5C2F2; padding: 6px 12px; border-radius: 8px; font-family: 'SF Mono', Monaco, monospace; font-size: 13px; font-weight: 700; color: #5B21B6;">
                    {senha_temp}
                  </span>
                </td>
              </tr>
            </table>

            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #DCC9F7; font-size: 11.5px; color: #6D28D9; font-weight: 500;">
              🔒 Por segurança, você criará sua senha definitiva no 1º login.
            </div>
          </td>
        </tr>
      </table>

      <!-- Botão CTA Direto para o App -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
        <tr>
          <td align="center">
            <a href="{link_login}" target="_blank" style="display: inline-block; background-color: #7C3AED; color: #FFFFFF; font-size: 13.5px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.28);">
              Acessar o Camilo Studio &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin: 0; font-size: 11.5px; line-height: 1.5; color: #857B94; text-align: center;">
        Dúvidas ou suporte? Entre em contato com a recepção do ateliê.
      </p>
    """

    html = _base_email_html("Seu Acesso — Camilo Studio", conteudo_html)

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
        logger.error(f"Erro ao enviar e-mail de novo acesso para {email_destino}: {e}")
        return False


def enviar_email_reset_senha_admin(nome: str, email_destino: str, nova_senha_temp: str) -> bool:
    """
    Envia o e-mail quando o administrador reseta a senha provisória de um colaborador.
    """
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

    conteudo_html = f"""
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #1E1233;">
        Olá, {nome}!
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 13.5px; line-height: 1.6; color: #524763;">
        O administrador do <strong>Camilo Studio</strong> gerou uma nova credencial provisória para o seu acesso ao sistema.
      </p>

      <!-- Card de Credenciais -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F6F0FD; border: 1px solid #DCC9F7; border-radius: 18px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 22px;">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #7C3AED; text-transform: uppercase; margin-bottom: 14px;">
              Nova Credencial Provisória
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 10px;">
              <tr>
                <td width="30%" style="font-size: 12px; color: #766B87; font-weight: 500;">E-mail:</td>
                <td width="70%" style="font-size: 12.5px; font-weight: 600; color: #1E1233; font-family: 'SF Mono', Monaco, monospace;">
                  {email_destino}
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="30%" style="font-size: 12px; color: #766B87; font-weight: 500;">Nova Senha:</td>
                <td width="70%">
                  <span style="display: inline-block; background-color: #FFFFFF; border: 1px solid #D5C2F2; padding: 6px 12px; border-radius: 8px; font-family: 'SF Mono', Monaco, monospace; font-size: 13px; font-weight: 700; color: #5B21B6;">
                    {nova_senha_temp}
                  </span>
                </td>
              </tr>
            </table>

            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #DCC9F7; font-size: 11.5px; color: #6D28D9; font-weight: 500;">
              🔒 Ao fazer login, você cadastrará uma nova senha pessoal.
            </div>
          </td>
        </tr>
      </table>

      <!-- Botão CTA Direto para o App -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
        <tr>
          <td align="center">
            <a href="{link_login}" target="_blank" style="display: inline-block; background-color: #7C3AED; color: #FFFFFF; font-size: 13.5px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.28);">
              Entrar e Atualizar Senha &rarr;
            </a>
          </td>
        </tr>
      </table>
    """

    html = _base_email_html("Redefinição de Acesso — Camilo Studio", conteudo_html)

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
        logger.error(f"Erro ao enviar e-mail de reset de senha para {email_destino}: {e}")
        return False
