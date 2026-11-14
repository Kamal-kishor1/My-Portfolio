from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.media import Media
from app.models.site_setting import SiteSetting
from app.models.user import User
from app.schemas.site_setting import AdminSiteSettings, AdminSiteSettingsUpdate
from app.services.admin_audit import record_admin_action

router = APIRouter(prefix="/admin/site-settings", tags=["admin:site-settings"])
_require_editor = require_role("admin", "editor")
_PUBLIC_KEYS = (
    "contact_email",
    "linkedin_url",
    "github_url",
    "open_to_work_enabled",
    "open_to_work_text",
)


def _get_setting(db: Session, key: str) -> SiteSetting | None:
    return db.query(SiteSetting).filter(SiteSetting.key == key).first()


def _put_setting(db: Session, key: str, value: str | None = None, media_id: int | None = None) -> None:
    setting = _get_setting(db, key)
    if setting is None:
        setting = SiteSetting(key=key)
        db.add(setting)
    setting.value = value
    setting.media_id = media_id


@router.get("/", response_model=AdminSiteSettings)
def read_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_editor),
):
    rows = db.query(SiteSetting).filter(SiteSetting.key.in_((*_PUBLIC_KEYS, "resume_pdf"))).all()
    values = {row.key: row for row in rows}
    resume_setting = values.get("resume_pdf")
    resume_id = resume_setting.media_id if resume_setting else None
    resume_media = db.query(Media).filter(Media.id == resume_id).first() if resume_id else None
    return AdminSiteSettings(
        contact_email=values.get("contact_email").value if values.get("contact_email") else None,
        linkedin_url=values.get("linkedin_url").value if values.get("linkedin_url") else None,
        github_url=values.get("github_url").value if values.get("github_url") else None,
        open_to_work_enabled=(values.get("open_to_work_enabled").value.lower() == "true") if values.get("open_to_work_enabled") else True,
        open_to_work_text=(values.get("open_to_work_text").value if values.get("open_to_work_text") and values.get("open_to_work_text").value else "Open to work · Backend / AI-ML Engineer · India (remote OK)"),
        resume_pdf_media_id=resume_id if resume_media and resume_media.content_type == "application/pdf" and resume_media.storage_key else None,
        resume_available=bool(resume_media and resume_media.content_type == "application/pdf" and resume_media.storage_key),
    )


@router.put("/", response_model=AdminSiteSettings)
def save_settings(
    payload: AdminSiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_editor),
):
    media = None
    if payload.resume_pdf_media_id is not None:
        media = db.query(Media).filter(Media.id == payload.resume_pdf_media_id).first()
        if not media or media.content_type != "application/pdf" or not media.storage_key:
            raise HTTPException(status_code=422, detail="Select an uploaded PDF from Neon Object Storage")

    values = {
        "contact_email": str(payload.contact_email) if payload.contact_email else None,
        "linkedin_url": str(payload.linkedin_url) if payload.linkedin_url else None,
        "github_url": str(payload.github_url) if payload.github_url else None,
        "open_to_work_enabled": "true" if payload.open_to_work_enabled else "false",
        "open_to_work_text": payload.open_to_work_text.strip(),
    }
    if not values["open_to_work_text"]:
        raise HTTPException(status_code=422, detail="Open-to-work text cannot be blank")

    for key, value in values.items():
        _put_setting(db, key, value=value)
    _put_setting(db, "resume_pdf", media_id=media.id if media else None)
    record_admin_action(db, current_user, "update", "site_settings", "public")
    db.commit()
    return read_settings(db=db, current_user=current_user)
