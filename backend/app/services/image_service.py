import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import get_settings

settings = get_settings()

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def _upload_dir() -> Path:
    directory = Path(settings.UPLOAD_DIR)
    directory.mkdir(parents=True, exist_ok=True)
    return directory


async def save_event_image(file: UploadFile) -> str:
    """Validates format and size, saves the file, and returns its public URL."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only JPG, JPEG, PNG and WEBP images are allowed",
        )

    original_suffix = Path(file.filename or "").suffix.lower()
    extension = (
        original_suffix if original_suffix in ALLOWED_EXTENSIONS else ALLOWED_CONTENT_TYPES[file.content_type]
    )

    max_bytes = int(settings.MAX_IMAGE_SIZE_MB * 1024 * 1024)
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="The image file is empty")
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image must be smaller than {settings.MAX_IMAGE_SIZE_MB:g} MB",
        )

    filename = f"{uuid.uuid4().hex}{extension}"
    destination = _upload_dir() / filename
    destination.write_bytes(contents)

    return f"{settings.STATIC_URL_PREFIX}/uploads/events/{filename}"
