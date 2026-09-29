import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.event import Event
    from app.models.user import User


class ParticipationStatus(str, enum.Enum):
    REGISTERED = "registered"
    CANCELLED = "cancelled"
    ATTENDED = "attended"


class Participation(Base):
    __tablename__ = "participations"
    __table_args__ = (UniqueConstraint("user_id", "event_id", name="uq_participation_user_event"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[ParticipationStatus] = mapped_column(
        Enum(
            ParticipationStatus,
            name="participation_status",
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=ParticipationStatus.REGISTERED,
    )
    registered_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="participations")
    event: Mapped["Event"] = relationship(back_populates="participations")
