from datetime import datetime

from pydantic import BaseModel, EmailStr


class ContactMessageOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
