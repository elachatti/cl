from typing import Callable, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.security import ACCESS_TOKEN_TYPE, TokenError, decode_token
from app.database.session import get_db
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the authenticated user from the Authorization: Bearer <jwt> header."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _credentials_exception()

    try:
        payload = decode_token(credentials.credentials, ACCESS_TOKEN_TYPE)
        user_id = int(payload["sub"])
    except (TokenError, ValueError, KeyError):
        raise _credentials_exception()

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise _credentials_exception()
    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Resolve the authenticated user if credentials are provided and valid, otherwise None."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None

    try:
        payload = decode_token(credentials.credentials, ACCESS_TOKEN_TYPE)
        user_id = int(payload["sub"])
    except (TokenError, ValueError, KeyError):
        return None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        return None
    return user


def require_roles(*roles: UserRole) -> Callable[..., User]:
    """Dependency factory restricting an endpoint to the given roles."""

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return role_checker

