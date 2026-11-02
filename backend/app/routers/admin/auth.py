from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.rate_limit import limiter
from app.schemas.auth import LoginRequest, TokenResponse, CurrentUser
from app.services import auth_service
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/admin/auth", tags=["admin:auth"])

REFRESH_COOKIE_NAME = "refresh_token"


def _require_trusted_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    production = settings.environment.lower() in {"production", "prod"}
    if not origin and not production:
        return
    if not origin or origin not in settings.cors_origin_list:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Untrusted request origin",
        )


def _set_refresh_cookie(response: Response, raw_refresh_token: str) -> None:
    # httpOnly: JS on the page can't read it (mitigates XSS token theft).
    production = settings.environment.lower() in {"production", "prod"}
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_refresh_token,
        httponly=True,
        secure=production,
        samesite="none" if production else "lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/api/admin/auth",
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.login_rate_limit)
def login(request: Request, payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    _require_trusted_origin(request)
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    access_token, raw_refresh_token = auth_service.issue_token_pair(db, user)
    _set_refresh_cookie(response, raw_refresh_token)
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    _require_trusted_origin(request)
    raw_refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not raw_refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    access_token, new_raw_refresh_token = auth_service.rotate_refresh_token(db, raw_refresh_token)
    _set_refresh_cookie(response, new_raw_refresh_token)
    return TokenResponse(access_token=access_token)


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    _require_trusted_origin(request)
    raw_refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_refresh_token:
        auth_service.revoke_refresh_token(db, raw_refresh_token)
    production = settings.environment.lower() in {"production", "prod"}
    response.delete_cookie(
        REFRESH_COOKIE_NAME,
        path="/api/admin/auth",
        secure=production,
        httponly=True,
        samesite="none" if production else "lax",
    )
    return {"status": "logged_out"}


@router.get("/me", response_model=CurrentUser)
def me(current_user: User = Depends(get_current_user)):
    return CurrentUser(id=current_user.id, email=current_user.email, role=current_user.role)
