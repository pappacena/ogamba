import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from uuid import uuid4

from main import app, get_current_user
from database import Base, get_db
import models

# Use an in-memory SQLite database for tests
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Global variable to simulate the current user logged in
current_user_logto_id = "user_1"

def override_get_current_user(db=pytest.mark.usefixtures("db")):
    # This will be overridden in specific tests using dependency_overrides
    db_user = db.query(models.User).filter(models.User.logto_id == current_user_logto_id).first()
    if not db_user:
        db_user = models.User(logto_id=current_user_logto_id)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def db():
    # Provide a clean database for each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db):
    return TestClient(app)

def test_create_project(client, db):
    # Set current user
    global current_user_logto_id
    current_user_logto_id = "user_1"

    app.dependency_overrides[get_current_user] = lambda: override_get_current_user(db)

    response = client.post("/projects/", json={"name": "Test Project"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project"
    assert "id" in data
    assert data["owner_id"] is not None

def test_list_projects(client, db):
    # Create projects for two different users
    user1_id = "user_1"
    user2_id = "user_2"

    # Create User 1
    db_user1 = models.User(logto_id=user1_id)
    db.add(db_user1)
    db.commit()
    db.refresh(db_user1)

    # Create User 2
    db_user2 = models.User(logto_id=user2_id)
    db.add(db_user2)
    db.commit()
    db.refresh(db_user2)

    # Create projects
    p1 = models.Project(name="User 1 Project", owner_id=db_user1.id)
    p2 = models.Project(name="User 2 Project", owner_id=db_user2.id)
    db.add(p1)
    db.add(p2)
    db.commit()

    # Test Listing as User 1
    global current_user_logto_id
    current_user_logto_id = user1_id
    app.dependency_overrides[get_current_user] = lambda: db_user1

    response = client.get("/projects/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "User 1 Project"

def test_update_project_owner(client, db):
    db_user = models.User(logto_id="user_1")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    project = models.Project(name="Old Name", owner_id=db_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)

    app.dependency_overrides[get_current_user] = lambda: db_user

    response = client.patch(f"/projects/{project.id}", json={"name": "New Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"

def test_update_project_not_owner(client, db):
    user1 = models.User(logto_id="user_1")
    user2 = models.User(logto_id="user_2")
    db.add(user1)
    db.add(user2)
    db.commit()

    project = models.Project(name="User 1 Project", owner_id=user1.id)
    db.add(project)
    db.commit()
    db.refresh(project)

    # Login as User 2
    app.dependency_overrides[get_current_user] = lambda: user2

    response = client.patch(f"/projects/{project.id}", json={"name": "Attacked!"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Project not found"

    # Verify name hasn't changed
    db.refresh(project)
    assert project.name == "User 1 Project"
