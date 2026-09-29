import logging
import smtplib
from email.message import EmailMessage
from html import escape

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _layout(title: str, greeting: str, body: str, button_label: str, link: str) -> str:
    return f"""\
<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5fa;font-family:Arial,Helvetica,sans-serif;color:#141a2e;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center">
        <table role="presentation" width="520" cellspacing="0" cellpadding="0"
               style="background:#ffffff;border-radius:12px;padding:32px;max-width:520px;">
          <tr><td>
            <h1 style="font-size:20px;margin:0 0 16px;">{escape(title)}</h1>
            <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">{escape(greeting)}</p>
            <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">{escape(body)}</p>
            <a href="{escape(link, quote=True)}"
               style="display:inline-block;background:#2f45e6;color:#ffffff;text-decoration:none;
                      padding:12px 22px;border-radius:8px;font-weight:bold;font-size:15px;">
              {escape(button_label)}
            </a>
            <p style="font-size:13px;line-height:1.5;color:#5b647d;margin:24px 0 0;">
              If the button does not work, copy this link into your browser:<br>
              <span style="word-break:break-all;">{escape(link)}</span>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
"""


def send_email(to_email: str, subject: str, text_body: str, html_body: str) -> None:
    """Send an email through SMTP. Without SMTP_HOST the message is logged to the console."""
    if not settings.SMTP_HOST:
        logger.warning(
            "SMTP is not configured. Email to %s (subject: %s) was NOT sent.\n%s",
            to_email,
            subject,
            text_body,
        )
        return

    message = EmailMessage()
    message["From"] = settings.EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    try:
        if settings.SMTP_USE_SSL:
            server: smtplib.SMTP = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        with server:
            if settings.SMTP_USE_TLS and not settings.SMTP_USE_SSL:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
        logger.info("Email sent to %s (subject: %s)", to_email, subject)
    except Exception:  # noqa: BLE001 - email failures must never crash a request
        logger.exception("Failed to send email to %s", to_email)


def send_verification_email(to_email: str, full_name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL.rstrip('/')}/verify-email?token={token}"
    subject = "Verify your AI Career Companion account"
    text = (
        f"Hi {full_name},\n\n"
        "Welcome to AI Career Companion. Confirm your email address to activate your account:\n"
        f"{link}\n\n"
        f"This link expires in {settings.EMAIL_VERIFY_EXPIRE_HOURS} hours."
    )
    html = _layout(
        "Confirm your email address",
        f"Hi {full_name},",
        "Welcome to AI Career Companion. Confirm your email address to activate your account. "
        f"This link expires in {settings.EMAIL_VERIFY_EXPIRE_HOURS} hours.",
        "Verify email",
        link,
    )
    send_email(to_email, subject, text, html)


def send_password_reset_email(to_email: str, full_name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"
    subject = "Reset your AI Career Companion password"
    text = (
        f"Hi {full_name},\n\n"
        "We received a request to reset your password. Choose a new one here:\n"
        f"{link}\n\n"
        f"This link expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes. "
        "If you did not request this, you can ignore this email."
    )
    html = _layout(
        "Reset your password",
        f"Hi {full_name},",
        "We received a request to reset your password. "
        f"This link expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes. "
        "If you did not request this, you can ignore this email.",
        "Choose a new password",
        link,
    )
    send_email(to_email, subject, text, html)
