from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AnalyticsEventCreate(BaseModel):
    path: str = Field(min_length=1, max_length=512)
    referrer: Optional[str] = Field(default=None, max_length=2048)


class AnalyticsEventOut(BaseModel):
    id: int
    path: str
    referrer: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
