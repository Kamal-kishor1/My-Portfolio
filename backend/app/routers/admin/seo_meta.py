from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.seo_meta import SeoMeta
from app.dependencies.auth import require_role
from app.schemas.seo_meta import SeoMetaBase, SeoMetaUpdate, SeoMetaOut
from app.services.admin_audit import record_admin_action

router = APIRouter(prefix="/admin/seo", tags=["admin:seo"])
_require_editor = require_role("admin", "editor")


@router.get("/", response_model=list[SeoMetaOut])
def list_seo_meta(
    entity_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_editor),
):
    query = db.query(SeoMeta)
    if entity_type:
        query = query.filter(SeoMeta.entity_type == entity_type)
    return query.all()


@router.get("/{seo_id}", response_model=SeoMetaOut)
def get_seo_meta(seo_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    entry = db.query(SeoMeta).filter(SeoMeta.id == seo_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SEO entry not found")
    return entry


@router.post("/", response_model=SeoMetaOut, status_code=status.HTTP_201_CREATED)
def create_seo_meta(
    payload: SeoMetaBase, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)
):
    # One SEO record per (entity_type, entity_id) pair - enforce it here rather
    # than a DB constraint, so the error message can be clear and actionable.
    existing = (
        db.query(SeoMeta)
        .filter(SeoMeta.entity_type == payload.entity_type, SeoMeta.entity_id == payload.entity_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"SEO meta already exists for {payload.entity_type}/{payload.entity_id} (id={existing.id}) - use PATCH instead",
        )
    entry = SeoMeta(**payload.model_dump())
    db.add(entry)
    db.flush()
    record_admin_action(db, current_user, "create", "seo_meta", entry.id)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/{seo_id}", response_model=SeoMetaOut)
def update_seo_meta(
    seo_id: int,
    payload: SeoMetaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_editor),
):
    entry = db.query(SeoMeta).filter(SeoMeta.id == seo_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SEO entry not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    record_admin_action(db, current_user, "update", "seo_meta", entry.id)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{seo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seo_meta(seo_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    entry = db.query(SeoMeta).filter(SeoMeta.id == seo_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SEO entry not found")
    db.delete(entry)
    record_admin_action(db, current_user, "delete", "seo_meta", seo_id)
    db.commit()
