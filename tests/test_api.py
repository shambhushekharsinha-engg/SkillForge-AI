import pytest
from fastapi.testclient import TestClient
from api.main import app
from skillforge.config import config
from skillforge.migrations import run_migrations
from api.seed import seed_database_if_empty

# Run migrations and seed for tests manually since TestClient(app) without 'with' doesn't run startup events
run_migrations(config.MEMORY_DB_PATH)
seed_database_if_empty(config.MEMORY_DB_PATH)

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    assert "skills_created" in response.json()

def test_search_skills():
    response = client.get("/api/skills/search?q=test")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_experiments():
    response = client.get("/api/experiments")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
