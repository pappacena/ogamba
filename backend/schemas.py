import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from pydantic import UUID4

class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    logto_id: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None

class Project(ProjectBase):
    id: UUID4
    owner_id: int

    model_config = ConfigDict(from_attributes=True)
