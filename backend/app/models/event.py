import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    Column,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import expression

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.comment import Comment
    from app.models.favorite import Favorite
    from app.models.interaction import Interaction
    from app.models.participation import Participation
    from app.models.tag import Tag
    from app.models.user import User


class TargetAudience(str, enum.Enum):
    STUDENTS = "students"
    CLUBS = "clubs"
    EVERYONE = "everyone"


# Many-to-many association between events and tags.
event_tags = Table(
    "event_tags",
    Base.metadata,
    Column("event_id", ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class EventCategory(str, enum.Enum):
    ARTIFICIAL_INTELLIGENCE = "artificial_intelligence"
    CYBERSECURITY = "cybersecurity"
    WEB_DEVELOPMENT = "web_development"
    MOBILE = "mobile"
    CLOUD = "cloud"
    DATA_SCIENCE = "data_science"
    ROBOTICS = "robotics"
    DEVOPS = "devops"
    GAME_DEVELOPMENT = "game_development"


class EventType(str, enum.Enum):
    HACKATHON = "hackathon"
    COMPETITION = "competition"
    WORKSHOP = "workshop"
    CONFERENCE = "conference"


def _values(enum_cls):  # type: ignore[no-untyped-def]
    return [member.value for member in enum_cls]


class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    # Legacy classification fields from Module 1. Kept for backward compatibility with
    # existing rows; the publication form introduced in Module 2 no longer sets them,
    # so they are now nullable. Filtering/search now happens on `tags` instead.
    category: Mapped[Optional[EventCategory]] = mapped_column(
        Enum(EventCategory, name="event_category", values_callable=_values),
        nullable=True,
        index=True,
    )
    event_type: Mapped[Optional[EventType]] = mapped_column(
        Enum(EventType, name="event_type", values_callable=_values),
        nullable=True,
        index=True,
    )
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    is_online: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=expression.false()
    )
    # `start_date` is the single event date/time referred to as "date" in the API
    # payloads (see EventBase.date in app/schemas/event.py, which maps to this column).
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    registration_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    registration_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    target_audience: Mapped[TargetAudience] = mapped_column(
        Enum(TargetAudience, name="target_audience", values_callable=_values),
        nullable=False,
        default=TargetAudience.EVERYONE,
        server_default=TargetAudience.EVERYONE.value,
        index=True,
    )
    max_participants: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    # `organizer_id` is exposed to the API/frontend as `created_by`.
    organizer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=expression.true()
    )

    organizer: Mapped["User"] = relationship(back_populates="events")
    tags: Mapped[List["Tag"]] = relationship(
        secondary=event_tags, back_populates="events", order_by="Tag.name"
    )
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )
    interactions: Mapped[List["Interaction"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )
    favorites: Mapped[List["Favorite"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )
    participations: Mapped[List["Participation"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Event id={self.id} title={self.title!r}>"
