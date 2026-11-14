from pydantic import BaseModel, EmailStr, HttpUrl


class PublicSiteSettings(BaseModel):
    contact_email: EmailStr | None = None
    linkedin_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    open_to_work_enabled: bool = True
    open_to_work_text: str = "Open to work · Backend / AI-ML Engineer · India (remote OK)"

