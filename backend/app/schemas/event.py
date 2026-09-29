from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.event import TargetAudience

MAX_TAGS = 8
MAX_TAG_LENGTH = 30


def _clean_tags(tags: List[str]) -> List[str]:
    """Trims, de-duplicates (case-insensitively) and caps the number of tags."""
    seen: set[str] = set()
    cleaned: List[str] = []
    for raw in tags:
        name = " ".join(raw.strip().split())
        if not name:
            continue
        if len(name) > MAX_TAG_LENGTH:
            raise ValueError(f"Each tag must be at most {MAX_TAG_LENGTH} characters")
        key = name.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(name)
    if len(cleaned) > MAX_TAGS:
        raise ValueError(f"You can add at most {MAX_TAGS} tags")
    return cleaned


TAG_CATEGORIES = {
    "ia": "tech",
    "ai": "tech",
    "cyber": "cyber",
    "cybersecurity": "cyber",
    "web": "tech",
    "web_development": "tech",
    "musique": "musique",
    "music": "musique",
    "sport": "sport",
    "design": "arts",
    "photo": "arts",
    "photography": "arts",
    "entrepreneuriat": "business",
    "business": "business",
}


class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    key: Optional[str] = None
    label: Optional[str] = None
    category: Optional[str] = None

    @model_validator(mode="after")
    def _fill_aliases(self) -> "TagOut":
        if not self.key:
            self.key = self.slug
        if not self.label:
            self.label = self.name
        if not self.category:
            self.category = TAG_CATEGORIES.get(self.slug.lower(), "tech")
        return self


class EventBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = Field(default=None, max_length=10000)
    desc: Optional[str] = Field(default=None, max_length=10000)
    # Exposed to the API as "date"; stored on the Event model as `start_date`.
    date: datetime
    registration_deadline: Optional[datetime] = None
    location: str = Field(min_length=2, max_length=255)
    tags: List[str] = Field(default_factory=list)
    target_audience: TargetAudience = TargetAudience.EVERYONE
    audience: Optional[str] = None
    max_participants: Optional[int] = Field(default=None, ge=1, le=1_000_000)
    registration_url: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="before")
    @classmethod
    def _normalize_fields(cls, data: object) -> object:
        if isinstance(data, dict):
            # Support Habiba's "desc" payload field
            if not data.get("description") and data.get("desc"):
                data["description"] = data["desc"]
            elif not data.get("desc") and data.get("description"):
                data["desc"] = data["description"]

            # Support Habiba's "audience" payload field
            if not data.get("target_audience") and data.get("audience"):
                raw_aud = str(data["audience"]).lower()
                aud_map = {
                    "tous": TargetAudience.EVERYONE,
                    "everyone": TargetAudience.EVERYONE,
                    "membres_club": TargetAudience.CLUBS,
                    "clubs": TargetAudience.CLUBS,
                    "faculte": TargetAudience.STUDENTS,
                    "students": TargetAudience.STUDENTS,
                }
                data["target_audience"] = aud_map.get(raw_aud, TargetAudience.EVERYONE)
        return data

    @field_validator("title")
    @classmethod
    def _clean_title(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 3:
            raise ValueError("Title is required")
        return value

    @field_validator("description")
    @classmethod
    def _clean_description(cls, value: Optional[str]) -> str:
        if not value or len(value.strip()) < 5:
            raise ValueError("Description is required")
        return value.strip()

    @field_validator("location")
    @classmethod
    def _clean_location(cls, value: str) -> str:
        value = " ".join(value.split())
        if not value:
            raise ValueError("Location is required")
        return value

    @field_validator("tags")
    @classmethod
    def _validate_tags(cls, value: List[str]) -> List[str]:
        return _clean_tags(value)

    @field_validator("registration_url")
    @classmethod
    def _validate_registration_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None
        if not (value.startswith("http://") or value.startswith("https://")):
            raise ValueError("Registration link must start with http:// or https://")
        return value

    @model_validator(mode="after")
    def _deadline_before_date(self) -> "EventBase":
        if self.registration_deadline is not None:
            deadline = self.registration_deadline
            date = self.date
            deadline_cmp = deadline if deadline.tzinfo else deadline.replace(tzinfo=timezone.utc)
            date_cmp = date if date.tzinfo else date.replace(tzinfo=timezone.utc)
            if deadline_cmp >= date_cmp:
                raise ValueError("Registration deadline must be before the event date")
        return self


class EventCreate(EventBase):
    """Payload for POST /events. `image_url` is set separately via the upload endpoint."""

    image_url: Optional[str] = None


class EventUpdate(EventBase):
    """Payload for PUT /events/{id}. A full replace of the editable fields."""

    image_url: Optional[str] = None


class OrganizerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str


class EventOut(BaseModel):
    id: int
    title: str
    description: str
    desc: Optional[str] = None
    date: datetime
    registration_deadline: Optional[datetime] = None
    location: str
    tags: List[TagOut]
    target_audience: TargetAudience
    audience: Optional[str] = None
    max_participants: Optional[int] = None
    image_url: Optional[str] = None
    registration_url: Optional[str] = None
    created_by: int
    club: Optional[str] = None
    organizer: OrganizerOut
    is_published: bool
    interested_count: int
    participants_count: int
    interested: Optional[int] = None
    going: Optional[int] = None
    user_interested: bool = False
    user_participating: bool = False
    created_at: datetime
    updated_at: datetime


class InteractionResponse(BaseModel):
    status: str = "ok"
    action: str
    type: str
    user_interested: bool
    user_participating: bool
    interested_count: int
    participants_count: int
    interested: int
    going: int



class PaginatedEvents(BaseModel):
    items: List[EventOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class ImageUploadResponse(BaseModel):
    image_url: str
