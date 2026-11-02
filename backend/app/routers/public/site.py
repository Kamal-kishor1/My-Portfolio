from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.media import Media
from app.models.seo_meta import SeoMeta
from app.schemas.site import HomepagePhotoOut
from app.services.object_storage import resolve_media_url

router = APIRouter(prefix="/api/site", tags=["public:site"])


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
