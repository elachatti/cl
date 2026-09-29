import re
from datetime import datetime, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.auth.dependencies import get_current_user_optional
from app.database.session import get_db
from app.models.event import Event, TargetAudience, event_tags
from app.models.interaction import Interaction, InteractionType
from app.models.tag import Tag
from app.models.user import User
from app.services.event_service import ensure_demo_club, ensure_demo_student

router = APIRouter(prefix="/events", tags=["Events"])


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")
    return slug or "tag"


def _get_or_create_tags(db: Session, names: List[str]) -> List[Tag]:
    tags: List[Tag] = []
    for name in names:
        if not name or not name.strip():
            continue
        slug = _slugify(name)
        tag = db.scalar(select(Tag).where(Tag.slug == slug))
        if tag is None:
            tag = Tag(name=name.strip().capitalize(), slug=slug)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags


def _parse_date(date_str: str) -> datetime:
    try:
        # Handles 2026-09-24T18:00 or ISO strings
        return datetime.fromisoformat(date_str)
    except Exception:
        return datetime.now(timezone.utc)


class EventIn(BaseModel):
    club: Optional[str] = None
    title: str = Field(..., min_length=1)
    date: str
    location: str
    tags: List[str] = Field(default_factory=list)
    audience: Optional[str] = "tous"
    desc: Optional[str] = None
    description: Optional[str] = None


@router.get("")
@router.get("/", include_in_schema=False)
def get_events(
    tags: Optional[str] = Query(default=None, description="tags séparés par des virgules"),
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Liste les événements avec leurs tags, triés du plus récent au plus ancien (logique Plateforme-clubi)."""
    base_query = select(Event).where(Event.is_published.is_(True))

    if tags:
        wanted_slugs = [_slugify(t) for t in tags.split(",") if t.strip()]
        if wanted_slugs:
            base_query = base_query.join(Event.tags).where(Tag.slug.in_(wanted_slugs))

    if search and search.strip():
        term = f"%{search.strip()}%"
        base_query = base_query.where(
            or_(
                Event.title.ilike(term),
                Event.description.ilike(term),
                Event.location.ilike(term),
            )
        )

    base_query = (
        base_query.distinct()
        .options(selectinload(Event.tags), selectinload(Event.organizer))
        .order_by(Event.start_date.desc())
    )

    events = list(db.scalars(base_query).all())

    results = []
    for e in events:
        # Count interactions
        interested_cnt = (
            db.scalar(
                select(func.count())
                .select_from(Interaction)
                .where(
                    Interaction.event_id == e.id,
                    Interaction.type == InteractionType.INTERESTED,
                )
            )
            or 0
        )

        going_cnt = (
            db.scalar(
                select(func.count())
                .select_from(Interaction)
                .where(
                    Interaction.event_id == e.id,
                    Interaction.type == InteractionType.PARTICIPATE,
                )
            )
            or 0
        )

        user_interested = False
        user_going = False
        if current_user:
            user_interested = (
                db.scalar(
                    select(func.count())
                    .select_from(Interaction)
                    .where(
                        Interaction.event_id == e.id,
                        Interaction.user_id == current_user.id,
                        Interaction.type == InteractionType.INTERESTED,
                    )
                )
                or 0
            ) > 0

            user_going = (
                db.scalar(
                    select(func.count())
                    .select_from(Interaction)
                    .where(
                        Interaction.event_id == e.id,
                        Interaction.user_id == current_user.id,
                        Interaction.type == InteractionType.PARTICIPATE,
                    )
                )
                or 0
            ) > 0

        # Format date for French display or keep ISO
        display_date = (
            e.start_date.strftime("%d %b %H:%M")
            if hasattr(e.start_date, "strftime")
            else str(e.start_date)
        )

        results.append(
            {
                "id": e.id,
                "title": e.title,
                "desc": e.description,
                "description": e.description,
                "date": display_date,
                "raw_date": e.start_date.isoformat() if hasattr(e.start_date, "isoformat") else str(e.start_date),
                "location": e.location,
                "audience": e.target_audience.value if hasattr(e.target_audience, "value") else str(e.target_audience),
                "club": e.organizer.full_name if e.organizer else (e.title or "Club Démo"),
                "tags": [t.slug for t in e.tags],
                "interested": interested_cnt,
                "going": going_cnt,
                "user_interested": user_interested,
                "user_going": user_going,
            }
        )

    return results


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_event(
    event: EventIn,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Crée un événement + ses tags (créés à la volée), logique exacte de Plateforme-clubi avec auth intégrée."""
    # Determine organizer
    organizer = current_user
    if organizer is None:
        organizer = db.scalar(select(User).where(User.role == "club")) or ensure_demo_club(db)

    # Convert audience string
    aud_map = {
        "tous": TargetAudience.EVERYONE,
        "everyone": TargetAudience.EVERYONE,
        "membres_club": TargetAudience.CLUBS,
        "clubs": TargetAudience.CLUBS,
        "faculte": TargetAudience.STUDENTS,
        "students": TargetAudience.STUDENTS,
    }
    target_aud = aud_map.get((event.audience or "").lower(), TargetAudience.EVERYONE)

    start_date = _parse_date(event.date)
    desc_val = (event.desc or event.description or "").strip()

    new_event = Event(
        title=event.title.strip(),
        description=desc_val,
        start_date=start_date,
        location=event.location.strip(),
        target_audience=target_aud,
        organizer_id=organizer.id,
        is_published=True,
        tags=_get_or_create_tags(db, event.tags),
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    club_name = event.club or organizer.full_name

    return {
        "id": new_event.id,
        "club": club_name,
        **event.model_dump(),
    }


@router.post("/{event_id}/interact")
def interact(
    event_id: int,
    type: str = Query(..., pattern="^(interested|going|participate)$"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> Any:
    """Enregistre un clic Intéressé/Je participe (idempotent / toggle)."""
    event = db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Événement introuvable")

    normalized = "participate" if type in ("going", "participate") else "interested"
    interaction_type = (
        InteractionType.PARTICIPATE if normalized == "participate" else InteractionType.INTERESTED
    )

    # Determine user
    user = current_user
    if user is None:
        user = db.scalar(select(User).where(User.role == "student")) or ensure_demo_student(db)

    existing = db.scalar(
        select(Interaction).where(
            Interaction.user_id == user.id,
            Interaction.event_id == event.id,
            Interaction.type == interaction_type,
        )
    )

    if existing:
        db.delete(existing)
        db.commit()
    else:
        new_int = Interaction(
            user_id=user.id,
            event_id=event.id,
            type=interaction_type,
        )
        db.add(new_int)
        db.commit()

    return {"status": "ok"}
