from pydantic import BaseModel, EmailStr, Field, HttpUrl


class PublicSiteSettings(BaseModel):
    contact_email: EmailStr | None = None
    linkedin_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    open_to_work_enabled: bool = True
    open_to_work_text: str = "Open to work · Backend / AI-ML Engineer · India"
    resume_available: bool = False


class AdminSiteSettings(PublicSiteSettings):
    resume_pdf_media_id: int | None = None


class AdminSiteSettingsUpdate(BaseModel):
    contact_email: EmailStr | None = None
    linkedin_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    open_to_work_enabled: bool
    open_to_work_text: str = Field(min_length=1, max_length=200)
    resume_pdf_media_id: int | None = None

