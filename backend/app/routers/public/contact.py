from fastapi import APIRouter, BackgroundTasks, Depends, Request
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.models.contact_message import ContactMessage
from app.services.contact_notifications import send_contact_notification

router = APIRouter(prefix="/api/contact", tags=["public:contact"])


class ContactMessageIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr = Field(max_length=320)
    message: str = Field(min_length=10, max_length=2000)
    website: str = Field(default="", max_length=500)

    @field_validator("name", "message", "website", mode="before")
    @classmethod
    def trim_values(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value


@router.post("/")
@limiter.limit(settings.contact_rate_limit)
def submit_contact_message(
    request: Request,
    background_tasks: BackgroundTasks,
    payload: ContactMessageIn,
    db: Session = Depends(get_db),
):
    if payload.website:
        return {"status": "received", "id": None}

    entry = ContactMessage(name=payload.name, email=payload.email, message=payload.message)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    background_tasks.add_task(send_contact_notification, entry.name, entry.email, entry.message)
    return {"status": "received", "id": entry.id}
