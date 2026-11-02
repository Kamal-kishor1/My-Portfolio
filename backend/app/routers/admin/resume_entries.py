from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.resume_entry import ResumeEntry
from app.dependencies.auth import require_role
from app.schemas.resume_entry import ResumeEntryBase, ResumeEntryUpdate, ResumeEntryOut
from app.services.admin_audit import record_admin_action

router = APIRouter(prefix="/admin/resume-entries", tags=["admin:resume"])
_require_editor = require_role("admin", "editor")


@router.get("/", response_model=list[ResumeEntryOut])
def list_entries(db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    return db.query(ResumeEntry).order_by(ResumeEntry.sort_order).all()


@router.post("/", response_model=ResumeEntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(payload: ResumeEntryBase, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    entry = ResumeEntry(**payload.model_dump())
    db.add(entry)
    db.flush()
    record_admin_action(db, current_user, "create", "resume_entry", entry.id)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/{entry_id}", response_model=ResumeEntryOut)
def update_entry(
    entry_id: int, payload: ResumeEntryUpdate, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)
):
    entry = db.query(ResumeEntry).filter(ResumeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume entry not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    record_admin_action(db, current_user, "update", "resume_entry", entry.id)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    entry = db.query(ResumeEntry).filter(ResumeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume entry not found")
    db.delete(entry)
    record_admin_action(db, current_user, "delete", "resume_entry", entry_id)
    db.commit()
