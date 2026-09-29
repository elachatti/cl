import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database.session import SessionLocal, init_db
from app.routers import auth_router, events_router
from app.services.auth_service import ensure_admin_user
from app.services.event_service import ensure_default_tags, ensure_seed_events

settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    if settings.AUTO_CREATE_TABLES:
        init_db()
    with SessionLocal() as db:
        ensure_admin_user(db)
        ensure_default_tags(db)
        ensure_seed_events(db)
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    logger.info("%s started (%s)", settings.APP_NAME, settings.APP_ENV)
    yield


app = FastAPI(
    title="Clubi API — Plateforme Clubs",
    version="2.0.0",
    description="Unified Backend API for Clubi Platform (Events, Bulletin Board & Authentication).",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list if settings.is_production else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount routes at root level (/events, /auth)
app.include_router(auth_router)
app.include_router(events_router)

# Mount routes with /api prefix for compatibility with /api/events, /api/auth
app.include_router(auth_router, prefix="/api")
app.include_router(events_router, prefix="/api")

# Serves uploaded event images (see app/services/image_service.py) at
# {STATIC_URL_PREFIX}/uploads/events/<file>. Assumes UPLOAD_DIR lives under ./static.
Path("static").mkdir(parents=True, exist_ok=True)
app.mount(settings.STATIC_URL_PREFIX, StaticFiles(directory="static"), name="static")


@app.get("/", tags=["System"])
def root() -> Dict[str, str]:
    return {
        "message": "API Clubi en ligne, connectée avec succès.",
        "events": "/api/events",
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
def health() -> Dict[str, str]:
    return {"status": "ok"}

