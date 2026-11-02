from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminAuditLogOut(BaseModel):
    id: int
    actor_user_id: int | None
    actor_email: str | None
    action: str
    entity_type: str
    entity_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
