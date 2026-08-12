from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router

from .seed import seed_database_if_empty
from skillforge.migrations import run_migrations
from skillforge.config import config

app = FastAPI(title="SkillForge-AI API", version="1.0.0")

@app.on_event("startup")
def on_startup():
    try:
        run_migrations(config.MEMORY_DB_PATH)
        seed_database_if_empty(config.MEMORY_DB_PATH)
    except Exception as e:
        print(f"Error seeding database: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "SkillForge-AI API is running."}
