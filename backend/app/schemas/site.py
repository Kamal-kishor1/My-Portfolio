from pydantic import BaseModel


class HomepagePhotoOut(BaseModel):
    url: str
    alt_text: str
