from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.resume_entry import ResumeEntry
from app.models.media import Media
from app.models.site_setting import SiteSetting
from app.schemas.resume_entry import ResumeEntryOut
from app.services.object_storage import presigned_download_url

router = APIRouter(prefix="/api/resume", tags=["public:resume"])


@router.get("/", response_model=list[ResumeEntryOut])
def get_resume(db: Session = Depends(get_db)):
    """Public: resume has no draft/published distinction - it's all public by nature."""
    return db.query(ResumeEntry).order_by(ResumeEntry.sort_order).all()


@router.get("/download", include_in_schema=True)
def download_resume(db: Session = Depends(get_db)):
    """Redirect visitors to a fresh, signed download of the configured PDF."""
    setting = db.query(SiteSetting).filter(SiteSetting.key == "resume_pdf").first()
    media = (
        db.query(Media)
        .filter(Media.id == setting.media_id, Media.content_type == "application/pdf")
        .first()
        if setting and setting.media_id
        else None
    )
    if not media or not media.storage_key:
        raise HTTPException(status_code=404, detail="Résumé PDF is not available")

    url = presigned_download_url(media.storage_key, filename="Kamal_Kishor_Resume.pdf")
    return RedirectResponse(url=url, status_code=302)
