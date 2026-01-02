from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from uuid import UUID
import models, schemas, database

app = FastAPI()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to get or create user based on logto_id
def get_user_by_logto_id(db: Session, logto_id: str):
    db_user = db.query(models.User).filter(models.User.logto_id == logto_id).first()
    if not db_user:
        db_user = models.User(logto_id=logto_id)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

# Dependency to get current user. For now, we expect Logto ID in X-Logto-User header.
# In a real app, this would verify a JWT.
def get_current_user(db: Session = Depends(database.get_db)):
    # Simple placeholder for Logto auth. We'll use this in tests.
    # In production, you would use a library to verify the Logto JWT.
    logto_id = "test_user_id" # Placeholder
    return get_user_by_logto_id(db, logto_id)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI API"}

@app.get("/items/", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return items

@app.post("/items/", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.post("/projects/", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_project = models.Project(**project.model_dump(), owner_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/", response_model=List[schemas.Project])
def list_projects(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Project).filter(models.Project.owner_id == current_user.id).all()

@app.patch("/projects/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: UUID,
    project: schemas.ProjectUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()

    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.name is not None:
        db_project.name = project.name

    db.commit()
    db.refresh(db_project)
    return db_project
