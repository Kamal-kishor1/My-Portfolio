from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.models.analytics_event import AnalyticsEvent
from app.schemas.analytics import AnalyticsEventCreate

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/event", status_code=201)
@limiter.limit(settings.analytics_rate_limit)
def log_event(payload: AnalyticsEventCreate, request: Request, db: Session = Depends(get_db)):
    user_agent = request.headers.get("user-agent")
    event = AnalyticsEvent(
        path=payload.path[:512],
        referrer=payload.referrer[:512] if payload.referrer else None,
        user_agent=user_agent[:512] if user_agent else None,
    )
    db.add(event)
    db.commit()
    return {"status": "ok"}
