from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.models.contact_message import ContactMessage

router = APIRouter(prefix="/api/contact", tags=["public:contact"])


class ContactMessageIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr = Field(max_length=320)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("name", "message")
    @classmethod
    def trim_and_reject_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value


@router.post("/")
@limiter.limit(settings.contact_rate_limit)
def submit_contact_message(
    request: Request,
    payload: ContactMessageIn,
    db: Session = Depends(get_db),
):
    entry = ContactMessage(name=payload.name, email=payload.email, message=payload.message)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"status": "received", "id": entry.id}
