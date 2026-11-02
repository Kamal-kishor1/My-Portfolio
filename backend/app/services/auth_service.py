from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
)
from app.models.user import User
from app.models.refresh_token import RefreshToken


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
    # Deliberately generic error: don't reveal whether the email exists.
    invalid_creds = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
    )
    if not user or not verify_password(password, user.password_hash):
        raise invalid_creds
    return user


def issue_token_pair(db: Session, user: User) -> tuple[str, str]:
    """Returns (access_token, raw_refresh_token). Persists the refresh token's HASH."""
    access_token = create_access_token(subject=str(user.id), role=user.role)

    raw_refresh_token = generate_refresh_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_refresh_token),
            expires_at=expires_at,
            revoked=False,
        )
    )
    db.commit()

    return access_token, raw_refresh_token


def rotate_refresh_token(db: Session, raw_refresh_token: str) -> tuple[str, str]:
    """
    Validates the presented refresh token, revokes it, and issues a new pair.
    Rotation means: if a stolen token is reused after the legitimate client
    already rotated it, the stolen one is already revoked and this raises 401 —
    that mismatch is itself a signal of token theft.
    """
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token"
    )

    token_hash = hash_refresh_token(raw_refresh_token)
    record = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked.is_(False))
        # Serialize concurrent refresh attempts so a token can be consumed only once.
        .with_for_update()
        .first()
    )
    if not record:
        raise invalid

    now = datetime.now(timezone.utc)
    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise invalid

    user = db.query(User).filter(User.id == record.user_id, User.is_active.is_(True)).first()
    if not user:
        raise invalid

    # Revoke the used token, then issue a fresh pair.
    record.revoked = True
    db.commit()

    return issue_token_pair(db, user)


def revoke_refresh_token(db: Session, raw_refresh_token: str) -> None:
    token_hash = hash_refresh_token(raw_refresh_token)
    record = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if record:
        record.revoked = True
        db.commit()
