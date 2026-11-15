import logging
import re

import httpx

from app.core.config import settings

logger = logging.getLogger("portfolio.contact_notifications")
_RESEND_ENDPOINT = "https://api.resend.com/emails"


def _single_line(value: str) -> str:
    return re.sub(r"[\r\n]+", " ", value).strip()


def send_contact_notification(name: str, visitor_email: str, message: str) -> None:
    """Send a Resend notification after the contact record has been committed."""
    api_key = settings.resend_api_key.get_secret_value()
    if settings.contact_notification_dry_run:
        logger.info("Contact notification attempted in dry-run mode; no email was sent")
        return
    if not api_key or not settings.resend_from_email or not settings.contact_notification_to:
        logger.warning("Contact notification skipped because Resend is not fully configured")
        return

    safe_name = _single_line(name)
    payload = {
        "from": settings.resend_from_email,
        "to": [settings.contact_notification_to],
        "reply_to": visitor_email,
        "subject": f"Portfolio contact from {safe_name}",
        "text": f"Name: {safe_name}\n\nMessage:\n{message}",
    }
    try:
        response = httpx.post(
            _RESEND_ENDPOINT,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload,
            timeout=10.0,
        )
        response.raise_for_status()
    except Exception:
        logger.exception("Resend contact notification failed")
