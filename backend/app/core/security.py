import secrets
from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import PyJWTError
from passlib.context import CryptContext

from app.core.config import settings

# argon2 is memory-hard (resistant to GPU cracking), the modern default choice.
# bcrypt is kept as a fallback verifier only, in case of migrating old hashes.
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(subject: str, role: str) -> str:
    """Short-lived JWT. 'subject' is the user id, embedded as the 'sub' claim."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": subject,
        "role": role,
        "type": "access",
        "iat": now,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """Raises PyJWTError if invalid/expired — caller handles it."""
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def generate_refresh_token() -> str:
    """
    Not a JWT — a plain high-entropy random token. We store only its HASH in the
    DB (refresh_tokens.token_hash), same principle as passwords: if the DB ever
    leaks, the raw tokens (which grant access) aren't recoverable from it.
    """
    return secrets.token_urlsafe(48)


def hash_refresh_token(raw_token: str) -> str:
    # Refresh tokens are already high-entropy random values (not user-chosen,
    # low-entropy secrets like passwords), so a fast, deterministic SHA-256
    # hash is appropriate here — unlike passwords, no need for a slow/salted
    # KDF, and determinism is what lets us look the token up by hash.
    import hashlib

    return hashlib.sha256(raw_token.encode()).hexdigest()
