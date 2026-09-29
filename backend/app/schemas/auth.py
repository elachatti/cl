import re
from typing import Annotated

from pydantic import AfterValidator, BaseModel, EmailStr, Field, field_validator, model_validator

from app.models.user import UserRole
from app.schemas.user import UserResponse


def _normalize_email(value: str) -> str:
    return value.strip().lower()


NormalizedEmail = Annotated[EmailStr, AfterValidator(_normalize_email)]


def validate_password_strength(value: str) -> str:
    """Passwords must be 8+ chars, contain a letter and a digit, and fit bcrypt's 72-byte limit."""
    if len(value.encode("utf-8")) > 72:
        raise ValueError("Password must be at most 72 bytes long")
    if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
        raise ValueError("Password must contain at least one letter and one number")
    return value


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: NormalizedEmail
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str = Field(min_length=1, max_length=72)
    role: UserRole = UserRole.STUDENT

    @field_validator("full_name")
    @classmethod
    def _clean_full_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("Full name must be at least 2 characters long")
        return value

    @field_validator("password")
    @classmethod
    def _check_password(cls, value: str) -> str:
        return validate_password_strength(value)

    @field_validator("role")
    @classmethod
    def _check_role(cls, value: UserRole) -> UserRole:
        if value == UserRole.ADMIN:
            raise ValueError("Role must be either 'student' or 'club'")
        return value

    @model_validator(mode="after")
    def _passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(BaseModel):
    email: NormalizedEmail
    password: str = Field(min_length=1, max_length=128)
    remember_me: bool = False


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=10, max_length=2048)


class ResendVerificationRequest(BaseModel):
    email: NormalizedEmail


class ForgotPasswordRequest(BaseModel):
    email: NormalizedEmail


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=2048)
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str = Field(min_length=1, max_length=72)

    @field_validator("password")
    @classmethod
    def _check_password(cls, value: str) -> str:
        return validate_password_strength(value)

    @model_validator(mode="after")
    def _passwords_match(self) -> "ResetPasswordRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class MessageResponse(BaseModel):
    message: str


class RegisterResponse(BaseModel):
    message: str
    user: UserResponse


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: UserRole
    user: UserResponse
