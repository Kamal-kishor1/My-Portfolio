from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.admin_audit_log import AdminAuditLog
from app.models.user import User
from app.schemas.admin_audit_log import AdminAuditLogOut

router = APIRouter(prefix="/admin/audit-logs", tags=["admin:audit"])
_require_admin = require_role("admin")


@router.get("/", response_model=list[AdminAuditLogOut])
def list_audit_logs(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_admin),
):
    rows = (
        db.query(AdminAuditLog, User.email)
        .outerjoin(User, User.id == AdminAuditLog.actor_user_id)
        .order_by(AdminAuditLog.created_at.desc(), AdminAuditLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": entry.id,
            "actor_user_id": entry.actor_user_id,
            "actor_email": email,
            "action": entry.action,
            "entity_type": entry.entity_type,
            "entity_id": entry.entity_id,
            "created_at": entry.created_at,
        }
        for entry, email in rows
    ]
