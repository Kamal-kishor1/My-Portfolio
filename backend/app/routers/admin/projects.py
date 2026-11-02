from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.dependencies.auth import require_role
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut
from app.services import project_service
from app.services.admin_audit import record_admin_action

router = APIRouter(prefix="/admin/projects", tags=["admin:projects"])

# Editors can manage content; only admins could be given further-restricted
# actions later (e.g. user management) by using require_role("admin") alone there.
_require_editor = require_role("admin", "editor")


@router.get("/", response_model=list[ProjectOut])
def list_all_projects(db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    """Includes unpublished/draft projects, unlike the public endpoint."""
    return project_service.list_projects(db, published_only=False)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    return project_service.get_project_or_404(db, project_id)


@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)
):
    project = project_service.create_project(db, payload)
    record_admin_action(db, current_user, "create", "project", project.id)
    db.commit()
    db.refresh(project)
    return project


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_editor),
):
    project = project_service.update_project(db, project_id, payload)
    record_admin_action(db, current_user, "update", "project", project.id)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    project_service.delete_project(db, project_id)
    record_admin_action(db, current_user, "delete", "project", project_id)
    db.commit()
