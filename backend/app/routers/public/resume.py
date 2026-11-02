from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.resume_entry import ResumeEntry
from app.schemas.resume_entry import ResumeEntryOut

router = APIRouter(prefix="/api/resume", tags=["public:resume"])


@router.get("/", response_model=list[ResumeEntryOut])
def get_resume(db: Session = Depends(get_db)):
    """Public: resume has no draft/published distinction - it's all public by nature."""
    return db.query(ResumeEntry).order_by(ResumeEntry.sort_order).all()
