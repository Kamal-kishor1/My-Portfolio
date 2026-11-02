from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.project import ProjectOut
from app.services import project_service

router = APIRouter(prefix="/api/projects", tags=["public:projects"])


@router.get("/", response_model=list[ProjectOut])
def list_published_projects(db: Session = Depends(get_db)):
    """Public endpoint: only ever returns published=True projects."""
    return project_service.list_projects(db, published_only=True)
