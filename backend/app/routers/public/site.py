from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.media import Media
from app.models.seo_meta import SeoMeta
from app.schemas.site import HomepagePhotoOut
from app.schemas.site_setting import PublicSiteSettings
from app.models.site_setting import SiteSetting
from app.services.object_storage import resolve_media_url

router = APIRouter(prefix="/api/site", tags=["public:site"])

_PUBLIC_SETTING_KEYS = {
    "contact_email",
    "linkedin_url",
    "github_url",
    "open_to_work_enabled",
    "open_to_work_text",
}


@router.get("-settings", response_model=PublicSiteSettings)
def get_public_site_settings(db: Session = Depends(get_db)):
    """Return only explicitly approved public settings."""
    rows = (
        db.query(SiteSetting)
        .filter(SiteSetting.key.in_(_PUBLIC_SETTING_KEYS))
        .all()
    )
    values = {row.key: row.value for row in rows}
    resume_setting = db.query(SiteSetting).filter(SiteSetting.key == "resume_pdf").first()
    resume_media = (
        db.query(Media)
        .filter(Media.id == resume_setting.media_id, Media.content_type == "application/pdf")
        .first()
        if resume_setting and resume_setting.media_id
        else None
    )
    return PublicSiteSettings(
        contact_email=values.get("contact_email") or None,
        linkedin_url=values.get("linkedin_url") or None,
        github_url=values.get("github_url") or None,
        open_to_work_enabled=(values.get("open_to_work_enabled", "true").lower() == "true"),
        open_to_work_text=(values.get("open_to_work_text") or "").strip() or "Open to work · Backend / AI-ML Engineer · India (remote OK)",
        resume_available=bool(resume_media and resume_media.storage_key),
    )


@router.get("/homepage-photo", response_model=HomepagePhotoOut | None)
def get_homepage_photo(db: Session = Depends(get_db)):
    """Return the optional site-wide profile photo, signing private media URLs."""
    settings = (
        db.query(SeoMeta)
        .filter(SeoMeta.entity_type == "site", SeoMeta.entity_id.is_(None))
        .first()
    )
    if not settings or not settings.og_image_id:
        return None

    media = db.query(Media).filter(Media.id == settings.og_image_id).first()
    if not media:
        return None

    return HomepagePhotoOut(
        url=resolve_media_url(media.url, media.storage_key),
        alt_text=media.alt_text or "Portrait of Kamal Kishor",
    )
