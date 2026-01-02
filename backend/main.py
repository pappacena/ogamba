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
from fastapi import Header
from typing import Optional

def get_current_user(
    x_logto_user: Optional[str] = Header(None, alias="X-Logto-User"),
    db: Session = Depends(database.get_db)
):
    # Simple placeholder for Logto auth. We'll use this in tests.
    logto_id = x_logto_user or "test_user_id"
    return get_user_by_logto_id(db, logto_id)


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI API"}


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
    return db.query(models.Project).filter(
        models.Project.owner_id == current_user.id,
        models.Project.deleted == False
    ).all()

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

    if project.deleted is not None:
        db_project.deleted = project.deleted

    db.commit()
    db.refresh(db_project)
    return db_project

# --- DataItem Endpoints ---

@app.get("/projects/{project_id}/data-items/", response_model=List[schemas.DataItem])
def list_data_items(
    project_id: UUID,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify project ownership
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return db.query(models.DataItem).filter(
        models.DataItem.project_id == project_id,
        models.DataItem.deleted == False
    ).all()

@app.post("/projects/{project_id}/data-items/", response_model=schemas.DataItem)
def create_data_item(
    project_id: UUID,
    data_item: schemas.DataItemCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify project ownership
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db_data_item = models.DataItem(
        **data_item.model_dump(),
        project_id=project_id
    )
    db.add(db_data_item)
    db.commit()
    db.refresh(db_data_item)
    return db_data_item

@app.patch("/projects/{project_id}/data-items/{data_item_id}", response_model=schemas.DataItem)
def update_data_item(
    project_id: UUID,
    data_item_id: UUID,
    data_item_update: schemas.DataItemUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify project ownership and data item existence
    db_data_item = db.query(models.DataItem).join(models.Project).filter(
        models.DataItem.id == data_item_id,
        models.DataItem.project_id == project_id,
        models.Project.owner_id == current_user.id
    ).first()

    if not db_data_item:
        raise HTTPException(status_code=404, detail="Data item not found")

    update_data = data_item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_data_item, key, value)

    db.commit()
    db.refresh(db_data_item)
    return db_data_item

@app.delete("/projects/{project_id}/data-items/{data_item_id}")
def delete_data_item(
    project_id: UUID,
    data_item_id: UUID,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify project ownership and data item existence
    db_data_item = db.query(models.DataItem).join(models.Project).filter(
        models.DataItem.id == data_item_id,
        models.DataItem.project_id == project_id,
        models.Project.owner_id == current_user.id
    ).first()

    if not db_data_item:
        raise HTTPException(status_code=404, detail="Data item not found")

    db_data_item.deleted = True
    db.commit()
    return {"message": "Data item soft-deleted"}
