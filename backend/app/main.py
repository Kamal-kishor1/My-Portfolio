import logging
import time

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import configure_logging
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.routers.public import projects as public_projects
from app.routers.public import contact as public_contact
from app.routers.public import blog_posts as public_blog_posts
from app.routers.public import resume as public_resume
from app.routers.public import analytics as public_analytics
from app.routers.public import site as public_site
from app.routers.admin import auth as admin_auth
from app.routers.admin import projects as admin_projects
from app.routers.admin import blog_posts as admin_blog_posts
from app.routers.admin import resume_entries as admin_resume_entries
from app.routers.admin import contact_messages as admin_contact_messages
from app.routers.admin import media as admin_media
from app.routers.admin import seo_meta as admin_seo_meta
from app.routers.admin import audit_logs as admin_audit_logs

configure_logging()
logger = logging.getLogger("portfolio.http")
app = FastAPI(title="Portfolio API", version="0.1.0")


@app.middleware("http")
async def request_logging(request: Request, call_next):
    started = time.perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
        return response
    finally:
        logger.info(
            "http_request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": status_code,
                "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            },
        )


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if settings.environment.lower() in {"production", "prod"}:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000")
    return response

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: configured via the comma-separated ALLOWED_ORIGINS environment variable.
# credentials=True is required so the httpOnly refresh-token cookie is sent.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Public routes (unauthenticated, read published content only)
app.include_router(public_projects.router)
app.include_router(public_contact.router)
app.include_router(public_blog_posts.router)
app.include_router(public_resume.router)
app.include_router(public_analytics.router)
app.include_router(public_site.router)

# Admin routes (JWT-protected, mounted under /api to avoid route collision with frontend UI)
app.include_router(admin_auth.router, prefix="/api")
app.include_router(admin_projects.router, prefix="/api")
app.include_router(admin_blog_posts.router, prefix="/api")
app.include_router(admin_resume_entries.router, prefix="/api")
app.include_router(admin_contact_messages.router, prefix="/api")
app.include_router(admin_media.router, prefix="/api")
app.include_router(admin_seo_meta.router, prefix="/api")
app.include_router(admin_audit_logs.router, prefix="/api")


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "unreachable"
    if db_status != "connected":
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail={"status": "unhealthy", "database": db_status})
    return {"status": "ok", "database": db_status}


@app.get("/live")
def liveness():
    return {"status": "alive"}


@app.get("/ready")
def readiness(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ready"}
