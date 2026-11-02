"""Idempotently provision the administrator from ADMIN_EMAIL and ADMIN_PASSWORD."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from email_validator import EmailNotValidError, validate_email

from app.core.database import SessionLocal
from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User


def seed_admin() -> None:
    email = settings.admin_email.strip().lower()
    password = settings.admin_password.get_secret_value()
    if not email or not password:
        raise RuntimeError("Set ADMIN_EMAIL and ADMIN_PASSWORD to provision the admin user")
    try:
        email = validate_email(email, check_deliverability=False).normalized
    except EmailNotValidError as exc:
        raise RuntimeError("ADMIN_EMAIL must be a valid email address") from exc
    if len(password) < 12:
        raise RuntimeError("ADMIN_PASSWORD must contain at least 12 characters")
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).one_or_none()
        if user is None:
            db.add(User(email=email, password_hash=hash_password(password), role="admin", is_active=True))
        elif user.role != "admin" or not user.is_active:
            raise RuntimeError("The configured admin email exists but is not an active administrator")
        db.commit()


if __name__ == "__main__":
    seed_admin()
