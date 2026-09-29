import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt

from app.config import get_settings

settings = get_settings()

ACCESS_TOKEN_TYPE = "access"
VERIFY_EMAIL_TOKEN_TYPE = "verify_email"
RESET_PASSWORD_TOKEN_TYPE = "reset_password"


class TokenError(Exception):
    """Raised when a JWT is invalid, expired or of the wrong type."""


# ---------- Password hashing ----------
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def password_fingerprint(password_hash: str) -> str:
    """Short digest of the stored hash; binds reset tokens to the current password."""
    return hashlib.sha256(password_hash.encode("utf-8")).hexdigest()[:16]


# ---------- JWT ----------
def _create_token(
    subject: int,
    token_type: str,
    expires_delta: timedelta,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: int, role: str, expires_delta: Optional[timedelta] = None) -> str:
    delta = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(user_id, ACCESS_TOKEN_TYPE, delta, {"role": role})


def create_purpose_token(
    user_id: int,
    token_type: str,
    expires_delta: timedelta,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    return _create_token(user_id, token_type, expires_delta, extra_claims)


def decode_token(token: str, expected_type: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["exp", "sub", "type"]},
        )
    except jwt.PyJWTError as exc:
        raise TokenError("Invalid or expired token") from exc

    if payload.get("type") != expected_type:
        raise TokenError("Invalid token type")
    return payload
