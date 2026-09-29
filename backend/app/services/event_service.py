import math
import re
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.event import Event, TargetAudience, event_tags
from app.models.interaction import Interaction, InteractionType
from app.models.participation import Participation, ParticipationStatus
from app.models.tag import Tag
from app.models.user import User
from app.schemas.event import EventCreate, EventOut, EventUpdate, OrganizerOut, TagOut

SortOption = str  # "newest" | "oldest" | "closest"
VALID_SORT_OPTIONS = {"newest", "oldest", "closest"}


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")
    return slug or "tag"


def _get_or_create_tags(db: Session, names: Sequence[str]) -> List[Tag]:
    tags: List[Tag] = []
    for name in names:
        slug = _slugify(name)
        tag = db.scalar(select(Tag).where(Tag.slug == slug))
        if tag is None:
            tag = Tag(name=name, slug=slug)
            db.add(tag)
            db.flush()  # assigns tag.id without committing, so it can be linked below
        tags.append(tag)
    return tags


def _interested_count(db: Session, event_id: int) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Interaction)
        .where(Interaction.event_id == event_id, Interaction.type == InteractionType.INTERESTED)
    ) or 0


DEFAULT_TAGS = [
    ("IA", "ia"),
    ("Cybersécurité", "cyber"),
    ("Développement web", "web"),
    ("Musique", "musique"),
    ("Sport", "sport"),
    ("Design", "design"),
    ("Photo", "photo"),
    ("Entrepreneuriat", "entrepreneuriat"),
]


def ensure_default_tags(db: Session) -> None:
    """Seed standard Clubi tags if they do not exist yet."""
    for name, slug in DEFAULT_TAGS:
        existing = db.scalar(select(Tag).where((Tag.slug == slug) | (Tag.name == name)))
        if not existing:
            db.add(Tag(name=name, slug=slug))
    try:
        db.commit()
    except Exception:
        db.rollback()


def ensure_demo_club(db: Session) -> User:
    """Ensures a default club user exists for demo mode and unauthenticated events."""
    club = db.scalar(select(User).where(User.role == "club"))
    if not club:
        from app.auth.security import hash_password
        club = User(
            full_name="Club Démo",
            email="demo@clubi.app",
            password_hash=hash_password("club123456"),
            role="club",
            is_verified=True,
            is_active=True,
        )
        db.add(club)
        db.commit()
        db.refresh(club)
    return club


def ensure_demo_student(db: Session) -> User:
    """Ensures a default student user exists for demo interactions."""
    student = db.scalar(select(User).where(User.role == "student"))
    if not student:
        from app.auth.security import hash_password
        student = User(
            full_name="Étudiant Démo",
            email="etudiant.demo@clubi.app",
            password_hash=hash_password("student123456"),
            role="student",
            is_verified=True,
            is_active=True,
        )
        db.add(student)
        db.commit()
        db.refresh(student)
    return student


def ensure_seed_events(db: Session) -> None:
    """Seed initial events from Plateforme-clubi if events table is empty."""
    event_count = db.scalar(select(func.count()).select_from(Event)) or 0
    if event_count > 0:
        return

    demo_club = ensure_demo_club(db)
    demo_student = ensure_demo_student(db)

    # 1. CTF
    ctf = Event(
        title="Capture The Flag — nuit blanche",
        description="Une nuit de CTF en équipes de 3, du reverse engineering au web exploitation. Pizzas et boissons fournies !",
        start_date=datetime.now(timezone.utc) + timedelta(days=3),
        location="Amphi B & Salle Réseau",
        target_audience=TargetAudience.EVERYONE,
        max_participants=60,
        organizer_id=demo_club.id,
        is_published=True,
        tags=_get_or_create_tags(db, ["Cybersécurité"]),
    )
    db.add(ctf)
    db.flush()

    # 2. IA Workshop
    ia_workshop = Event(
        title="Atelier : construire son premier modèle de classification",
        description="On code ensemble un classifieur en Python avec Scikit-Learn et PyTorch, aucun prérequis en machine learning.",
        start_date=datetime.now(timezone.utc) + timedelta(days=5),
        location="Salle info 3",
        target_audience=TargetAudience.EVERYONE,
        max_participants=35,
        organizer_id=demo_club.id,
        is_published=True,
        tags=_get_or_create_tags(db, ["IA", "Développement web"]),
    )
    db.add(ia_workshop)
    db.flush()

    # 3. Open mic
    open_mic = Event(
        title="Scène ouverte de rentrée",
        description="Chante, joue, slame — 5 min par passage sur scène. Venez nombreux découvrir les talents musicaux du campus !",
        start_date=datetime.now(timezone.utc) + timedelta(days=7),
        location="Foyer étudiant",
        target_audience=TargetAudience.EVERYONE,
        max_participants=120,
        organizer_id=demo_club.id,
        is_published=True,
        tags=_get_or_create_tags(db, ["Musique", "Design"]),
    )
    db.add(open_mic)
    db.flush()

    # Seed demo interactions
    db.add(Interaction(user_id=demo_student.id, event_id=ctf.id, type=InteractionType.INTERESTED))
    db.add(Interaction(user_id=demo_student.id, event_id=ia_workshop.id, type=InteractionType.PARTICIPATE))

    try:
        db.commit()
    except Exception:
        db.rollback()


def _participants_count(db: Session, event_id: int) -> int:
    direct = (
        db.scalar(
            select(func.count())
            .select_from(Participation)
            .where(
                Participation.event_id == event_id,
                Participation.status != ParticipationStatus.CANCELLED,
            )
        )
        or 0
    )
    interact_participate = (
        db.scalar(
            select(func.count())
            .select_from(Interaction)
            .where(
                Interaction.event_id == event_id,
                Interaction.type == InteractionType.PARTICIPATE,
            )
        )
        or 0
    )
    return max(direct, interact_participate)


def serialize_event(db: Session, event: Event, current_user: Optional[User] = None) -> EventOut:
    interested_cnt = _interested_count(db, event.id)
    participants_cnt = _participants_count(db, event.id)

    user_interested = False
    user_participating = False
    if current_user:
        user_interested = (
            db.scalar(
                select(func.count())
                .select_from(Interaction)
                .where(
                    Interaction.event_id == event.id,
                    Interaction.user_id == current_user.id,
                    Interaction.type == InteractionType.INTERESTED,
                )
            )
            or 0
        ) > 0
        user_participating = (
            db.scalar(
                select(func.count())
                .select_from(Interaction)
                .where(
                    Interaction.event_id == event.id,
                    Interaction.user_id == current_user.id,
                    Interaction.type == InteractionType.PARTICIPATE,
                )
            )
            or 0
        ) > 0 or (
            db.scalar(
                select(func.count())
                .select_from(Participation)
                .where(
                    Participation.event_id == event.id,
                    Participation.user_id == current_user.id,
                    Participation.status != ParticipationStatus.CANCELLED,
                )
            )
            or 0
        ) > 0

    organizer_out = (
        OrganizerOut.model_validate(event.organizer)
        if event.organizer
        else OrganizerOut(id=event.organizer_id, full_name="Club")
    )

    return EventOut(
        id=event.id,
        title=event.title,
        description=event.description,
        desc=event.description,
        date=event.start_date,
        registration_deadline=event.registration_deadline,
        location=event.location,
        tags=[TagOut.model_validate(tag) for tag in event.tags],
        target_audience=event.target_audience,
        audience=event.target_audience.value if hasattr(event.target_audience, "value") else str(event.target_audience),
        max_participants=event.max_participants,
        image_url=event.image_url,
        registration_url=event.registration_url,
        created_by=event.organizer_id,
        club=organizer_out.full_name,
        organizer=organizer_out,
        is_published=event.is_published,
        interested_count=interested_cnt,
        participants_count=participants_cnt,
        interested=interested_cnt,
        going=participants_cnt,
        user_interested=user_interested,
        user_participating=user_participating,
        created_at=event.created_at,
        updated_at=event.updated_at,
    )


def get_event_or_404(db: Session, event_id: int) -> Event:
    event = db.scalar(
        select(Event)
        .options(selectinload(Event.tags), selectinload(Event.organizer))
        .where(Event.id == event_id)
    )
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


def toggle_interaction(
    db: Session, event_id: int, user: Optional[User], type_str: str
) -> dict:
    """Toggles an interaction (interested or going/participate) for the specified event."""
    event = get_event_or_404(db, event_id)

    normalized_type = type_str.lower().strip()
    if normalized_type in ("going", "participate"):
        interaction_type = InteractionType.PARTICIPATE
    elif normalized_type == "interested":
        interaction_type = InteractionType.INTERESTED
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid interaction type '{type_str}'. Must be 'interested', 'going', or 'participate'."
        )

    # If no authenticated user, resolve a demo/guest user so interaction works in preview/demo mode
    target_user = user
    if target_user is None:
        target_user = db.scalar(select(User).where(User.role == "student")) or ensure_demo_student(db)

    existing = db.scalar(
        select(Interaction).where(
            Interaction.user_id == target_user.id,
            Interaction.event_id == event.id,
            Interaction.type == interaction_type,
        )
    )

    if existing:
        db.delete(existing)
        db.commit()
        action = "removed"
    else:
        new_interaction = Interaction(
            user_id=target_user.id,
            event_id=event.id,
            type=interaction_type,
        )
        db.add(new_interaction)
        db.commit()
        action = "added"

    interested_cnt = _interested_count(db, event.id)
    participants_cnt = _participants_count(db, event.id)

    user_int = (
        db.scalar(
            select(func.count())
            .select_from(Interaction)
            .where(
                Interaction.event_id == event.id,
                Interaction.user_id == target_user.id,
                Interaction.type == InteractionType.INTERESTED,
            )
        )
        or 0
    ) > 0
    user_part = (
        db.scalar(
            select(func.count())
            .select_from(Interaction)
            .where(
                Interaction.event_id == event.id,
                Interaction.user_id == target_user.id,
                Interaction.type == InteractionType.PARTICIPATE,
            )
        )
        or 0
    ) > 0

    return {
        "status": "ok",
        "action": action,
        "type": normalized_type,
        "user_interested": user_int,
        "user_participating": user_part,
        "interested_count": interested_cnt,
        "participants_count": participants_cnt,
        "interested": interested_cnt,
        "going": participants_cnt,
    }


def create_event(db: Session, organizer: Optional[User], payload: EventCreate) -> Event:
    # If organizer is not provided or not a club, fallback to demo club
    effective_organizer = organizer
    if effective_organizer is None:
        effective_organizer = db.scalar(select(User).where(User.role == "club")) or ensure_demo_club(db)

    event = Event(
        title=payload.title,
        description=payload.description or payload.desc or "",
        start_date=payload.date,
        registration_deadline=payload.registration_deadline,
        location=payload.location,
        target_audience=payload.target_audience,
        max_participants=payload.max_participants,
        registration_url=payload.registration_url,
        image_url=payload.image_url,
        organizer_id=effective_organizer.id,
        tags=_get_or_create_tags(db, payload.tags),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return get_event_or_404(db, event.id)



def update_event(db: Session, event: Event, current_user: User, payload: EventUpdate) -> Event:
    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit events you created",
        )

    event.title = payload.title
    event.description = payload.description
    event.start_date = payload.date
    event.registration_deadline = payload.registration_deadline
    event.location = payload.location
    event.target_audience = payload.target_audience
    event.max_participants = payload.max_participants
    event.registration_url = payload.registration_url
    if payload.image_url is not None:
        event.image_url = payload.image_url
    event.tags = _get_or_create_tags(db, payload.tags)

    db.commit()
    db.refresh(event)
    return get_event_or_404(db, event.id)


def delete_event(db: Session, event: Event, current_user: User) -> None:
    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete events you created",
        )
    db.delete(event)
    db.commit()


def list_events(
    db: Session,
    *,
    tags: Optional[List[str]] = None,
    target: Optional[TargetAudience] = None,
    search: Optional[str] = None,
    upcoming_only: bool = False,
    page: int = 1,
    page_size: int = 12,
    sort: SortOption = "newest",
) -> tuple[List[Event], int]:
    if sort not in VALID_SORT_OPTIONS:
        sort = "newest"

    base_query = select(Event).where(Event.is_published.is_(True))
    count_query = select(func.count(func.distinct(Event.id))).where(Event.is_published.is_(True))

    if tags:
        slugs = [_slugify(name) for name in tags if name.strip()]
        if slugs:
            base_query = base_query.join(Event.tags).where(Tag.slug.in_(slugs))
            count_query = count_query.join(event_tags, event_tags.c.event_id == Event.id).join(
                Tag, Tag.id == event_tags.c.tag_id
            ).where(Tag.slug.in_(slugs))

    if target is not None:
        base_query = base_query.where(Event.target_audience == target)
        count_query = count_query.where(Event.target_audience == target)

    if search:
        pattern = f"%{search.strip()}%"
        base_query = base_query.where(or_(Event.title.ilike(pattern), Event.description.ilike(pattern)))
        count_query = count_query.where(or_(Event.title.ilike(pattern), Event.description.ilike(pattern)))

    if upcoming_only:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        base_query = base_query.where(Event.start_date >= now)
        count_query = count_query.where(Event.start_date >= now)

    total = db.scalar(count_query) or 0

    if sort == "oldest":
        base_query = base_query.order_by(Event.created_at.asc())
    elif sort == "closest":
        base_query = base_query.order_by(Event.start_date.asc())
    else:
        base_query = base_query.order_by(Event.created_at.desc())

    base_query = (
        base_query.distinct()
        .options(selectinload(Event.tags), selectinload(Event.organizer))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    events = list(db.scalars(base_query).all())
    return events, total


def total_pages(total: int, page_size: int) -> int:
    if total == 0:
        return 1
    return math.ceil(total / page_size)
