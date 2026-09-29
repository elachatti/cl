import logging
from datetime import timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.security import (
    RESET_PASSWORD_TOKEN_TYPE,
    VERIFY_EMAIL_TOKEN_TYPE,
    TokenError,
    create_access_token,
    create_purpose_token,
    decode_token,
    hash_password,
    password_fingerprint,
    verify_password,
)
from app.config import get_settings
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, TokenResponse
from app.schemas.user import UserResponse

logger = logging.getLogger(__name__)
settings = get_settings()

_dummy_hash: Optional[str] = None


def _get_dummy_hash() -> str:
    """Hash verified when the email is unknown, so login timing does not reveal valid emails."""
    global _dummy_hash
    if _dummy_hash is None:
        _dummy_hash = hash_password("dummy-password-for-timing-protection")
    return _dummy_hash


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.scalar(select(User).where(User.email == email))


# ---------- Registration ----------
def register_user(db: Session, data: RegisterRequest) -> User:
    if get_user_by_email(db, data.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        is_verified=not settings.REQUIRE_EMAIL_VERIFICATION,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    db.refresh(user)
    return user


def create_verification_token(user: User) -> str:
    return create_purpose_token(
        user.id,
        VERIFY_EMAIL_TOKEN_TYPE,
        timedelta(hours=settings.EMAIL_VERIFY_EXPIRE_HOURS),
    )


# ---------- Login ----------
def authenticate_user(db: Session, email: str, password: str) -> User:
    from sqlalchemy import text

    result = db.execute(text("SELECT DATABASE()")).scalar()
    print("Current database:", result)

    rows = db.execute(text("SELECT email FROM users")).fetchall()
    print("Users in backend database:", rows)
    user = get_user_by_email(db, email)
    print("===================================")
    print("Email entered:", email)
    print("User found:", user)

    if user:
        print("Stored hash:", user.password_hash)
        print("Password valid:", verify_password(password, user.password_hash))
        print("===================================")
    if user is None:
        verify_password(password, _get_dummy_hash())
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )

    if settings.REQUIRE_EMAIL_VERIFICATION and not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before signing in",
        )

    return user


def build_token_response(user: User, remember_me: bool) -> TokenResponse:
    if remember_me:
        expires = timedelta(days=settings.REMEMBER_ME_EXPIRE_DAYS)
    else:
        expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    token = create_access_token(user.id, user.role.value, expires)
    return TokenResponse(
        access_token=token,
        expires_in=int(expires.total_seconds()),
        role=user.role,
        user=UserResponse.model_validate(user),
    )


# ---------- Email verification ----------
def verify_email(db: Session, token: str) -> None:
    try:
        payload = decode_token(token, VERIFY_EMAIL_TOKEN_TYPE)
        user_id = int(payload["sub"])
    except (TokenError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification link is invalid or has expired",
        )

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification link is invalid or has expired",
        )

    if not user.is_verified:  # idempotent: re-opening the link is harmless
        user.is_verified = True
        db.commit()


def get_unverified_user(db: Session, email: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if user is None or user.is_verified or not user.is_active:
        return None
    return user


# ---------- Password reset ----------
def get_active_user_by_email(db: Session, email: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if user is None or not user.is_active:
        return None
    return user


def create_reset_token(user: User) -> str:
    return create_purpose_token(
        user.id,
        RESET_PASSWORD_TOKEN_TYPE,
        timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES),
        {"pwd": password_fingerprint(user.password_hash)},
    )


def reset_password(db: Session, token: str, new_password: str) -> None:
    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="This reset link is invalid or has expired",
    )
    try:
        payload = decode_token(token, RESET_PASSWORD_TOKEN_TYPE)
        user_id = int(payload["sub"])
    except (TokenError, ValueError, KeyError):
        raise invalid

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise invalid

    # The token is single-use: it stops matching once the password has changed.
    if payload.get("pwd") != password_fingerprint(user.password_hash):
        raise invalid

    user.password_hash = hash_password(new_password)
    user.is_verified = True  # receiving the reset email proves ownership of the address
    db.commit()


# ---------- Bootstrap ----------
def ensure_admin_user(db: Session) -> None:
    """Create the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist."""
    email = settings.ADMIN_EMAIL.strip().lower()
    password = settings.ADMIN_PASSWORD
    if not email or not password:
        return

    if get_user_by_email(db, email) is not None:
        return

    admin = User(
        full_name=settings.ADMIN_FULL_NAME,
        email=email,
        password_hash=hash_password(password),
        role=UserRole.ADMIN,
        is_verified=True,
    )
    db.add(admin)
    try:
        db.commit()
        logger.info("Admin account created for %s", email)
    except IntegrityError:
        db.rollback()
