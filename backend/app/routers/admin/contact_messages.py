from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.contact_message import ContactMessage
from app.dependencies.auth import require_role
from app.schemas.contact_message import ContactMessageOut
from app.services.admin_audit import record_admin_action

router = APIRouter(prefix="/admin/contact-messages", tags=["admin:contact"])
_require_editor = require_role("admin", "editor")


@router.get("/", response_model=list[ContactMessageOut])
def list_messages(db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


@router.patch("/{message_id}/read", response_model=ContactMessageOut)
def mark_read(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    msg.is_read = True
    record_admin_action(db, current_user, "mark_read", "contact_message", msg.id)
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    db.delete(msg)
    record_admin_action(db, current_user, "delete", "contact_message", message_id)
    db.commit()
