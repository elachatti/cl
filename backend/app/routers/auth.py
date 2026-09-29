from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    RegisterResponse,
    ResendVerificationRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.schemas.user import UserResponse
from app.services import auth_service, email_service
from app.utils.rate_limit import RateLimiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

login_limiter = RateLimiter("login", max_requests=10, window_seconds=60)
register_limiter = RateLimiter("register", max_requests=5, window_seconds=60)
email_limiter = RateLimiter("email", max_requests=5, window_seconds=60)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(register_limiter)],
)
def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> RegisterResponse:
    user = auth_service.register_user(db, payload)

    if user.is_verified:
        message = "Account created. You can sign in now."
    else:
        token = auth_service.create_verification_token(user)
        background_tasks.add_task(
            email_service.send_verification_email, user.email, user.full_name, token
        )
        message = "Account created. Check your inbox to verify your email address."

    return RegisterResponse(message=message, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse, dependencies=[Depends(login_limiter)])
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    return auth_service.build_token_response(user, payload.remember_me)


@router.post("/logout", response_model=MessageResponse)
def logout(_: User = Depends(get_current_user)) -> MessageResponse:
    # JWTs are stateless: the client discards its token. The endpoint exists so the
    # frontend has a single place to call, and to allow server-side revocation later.
    return MessageResponse(message="Signed out successfully")


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)) -> MessageResponse:
    auth_service.verify_email(db, payload.token)
    return MessageResponse(message="Your email address has been verified. You can sign in now.")


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    dependencies=[Depends(email_limiter)],
)
def resend_verification(
    payload: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> MessageResponse:
    user = auth_service.get_unverified_user(db, payload.email)
    if user is not None:
        token = auth_service.create_verification_token(user)
        background_tasks.add_task(
            email_service.send_verification_email, user.email, user.full_name, token
        )
    # Same answer whether or not the account exists, to avoid revealing registered emails.
    return MessageResponse(
        message="If an unverified account exists for this email, a new verification link is on its way."
    )


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    dependencies=[Depends(email_limiter)],
)
def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> MessageResponse:
    user = auth_service.get_active_user_by_email(db, payload.email)
    if user is not None:
        token = auth_service.create_reset_token(user)
        background_tasks.add_task(
            email_service.send_password_reset_email, user.email, user.full_name, token
        )
    return MessageResponse(
        message="If an account exists for this email, a password reset link is on its way."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
    auth_service.reset_password(db, payload.token, payload.password)
    return MessageResponse(message="Your password has been updated. You can sign in now.")
