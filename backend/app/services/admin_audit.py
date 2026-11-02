from sqlalchemy.orm import Session

from app.models.admin_audit_log import AdminAuditLog
from app.models.user import User


def record_admin_action(
    db: Session,
    actor: User,
    action: str,
    entity_type: str,
    entity_id: int | str,
) -> None:
    """Add an audit row to the current transaction; callers commit with the change."""
    db.add(
        AdminAuditLog(
            actor_user_id=actor.id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
        )
    )
