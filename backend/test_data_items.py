import pytest
from fastapi.testclient import TestClient

from main import app
from database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
import uuid

# --- Test DB Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_data_item_success():
    # 1. Create a user and a project
    user_resp = client.post("/projects/", json={"name": "Test Project"}, headers={"X-Logto-User": "user1"})
    project_id = user_resp.json()["id"]

    # 2. Create a valid DataItem with the new simplified format
    payload = {
        "input_message": [
            {"type": "text", "content": "Hello"}
        ]
    }
    resp = client.post(f"/projects/{project_id}/data-items/", json=payload, headers={"X-Logto-User": "user1"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["input_message"][0]["type"] == "text"
    assert data["input_message"][0]["content"] == "Hello"

def test_create_data_item_invalid_format():
    user_resp = client.post("/projects/", json={"name": "Test Project"}, headers={"X-Logto-User": "user1"})
    project_id = user_resp.json()["id"]

    # Invalid type
    payload = {
        "input_message": [{"type": "invalid", "content": "Hello"}]
    }
    resp = client.post(f"/projects/{project_id}/data-items/", json=payload, headers={"X-Logto-User": "user1"})
    assert resp.status_code == 422

    # Missing content
    payload = {
        "input_message": [{"type": "text"}]
    }
    resp = client.post(f"/projects/{project_id}/data-items/", json=payload, headers={"X-Logto-User": "user1"})
    assert resp.status_code == 422

def test_data_item_ownership():
    # User 1 creates a project
    user1_proj = client.post("/projects/", json={"name": "User 1 Project"}, headers={"X-Logto-User": "user1"}).json()
    project_id = user1_proj["id"]

    # User 2 tries to create an item in User 1's project
    payload = {
        "input_message": [{"type": "text", "content": "Hack"}]
    }
    resp = client.post(f"/projects/{project_id}/data-items/", json=payload, headers={"X-Logto-User": "user2"})
    assert resp.status_code == 404

def test_list_data_items():
    user_resp = client.post("/projects/", json={"name": "Test Project"}, headers={"X-Logto-User": "user1"})
    project_id = user_resp.json()["id"]

    client.post(f"/projects/{project_id}/data-items/", json={
        "input_message": [{"type": "text", "content": "Item 1"}]
    }, headers={"X-Logto-User": "user1"})

    resp = client.get(f"/projects/{project_id}/data-items/", headers={"X-Logto-User": "user1"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1

def test_soft_delete_data_item():
    user_resp = client.post("/projects/", json={"name": "Test Project"}, headers={"X-Logto-User": "user1"})
    project_id = user_resp.json()["id"]

    item = client.post(f"/projects/{project_id}/data-items/", json={
        "input_message": [{"type": "text", "content": "To delete"}]
    }, headers={"X-Logto-User": "user1"}).json()
    item_id = item["id"]

    # Delete
    del_resp = client.delete(f"/projects/{project_id}/data-items/{item_id}", headers={"X-Logto-User": "user1"})
    assert del_resp.status_code == 200

    # Verify not in list
    list_resp = client.get(f"/projects/{project_id}/data-items/", headers={"X-Logto-User": "user1"})
    assert len(list_resp.json()) == 0
