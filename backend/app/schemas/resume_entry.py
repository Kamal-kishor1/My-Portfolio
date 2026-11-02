from datetime import date
from typing import Optional

from pydantic import BaseModel


class ResumeEntryBase(BaseModel):
    type: str  # 'experience' | 'education' | 'skill'
    title: str
    organization: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    sort_order: int = 0


class ResumeEntryUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    organization: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    sort_order: Optional[int] = None


class ResumeEntryOut(ResumeEntryBase):
    id: int

    model_config = {"from_attributes": True}
