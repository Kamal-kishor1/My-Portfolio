from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MediaCreate(BaseModel):
    filename: str
    url: str
    alt_text: Optional[str] = Field(default=None, max_length=500)


class MediaOut(BaseModel):
    id: int
    filename: str
    url: str
    alt_text: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: datetime
    content_type: Optional[str] = None

    model_config = {"from_attributes": True}
