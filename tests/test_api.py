import pytest
from fastapi.testclient import TestClient
from api.main import app

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
