import enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import expression

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.comment import Comment
    from app.models.event import Event
    from app.models.favorite import Favorite
    from app.models.interaction import Interaction
    from app.models.participation import Participation


class UserRole(str, enum.Enum):
    STUDENT = "student"
    CLUB = "club"
    ADMIN = "admin"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=UserRole.STUDENT,
        index=True,
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=expression.false()
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=expression.true()
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    events: Mapped[List["Event"]] = relationship(
        back_populates="organizer", cascade="all, delete-orphan"
    )
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    interactions: Mapped[List["Interaction"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    favorites: Mapped[List["Favorite"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    participations: Mapped[List["Participation"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role.value}>"
