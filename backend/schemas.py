import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from pydantic import UUID4


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
    deleted: Optional[bool] = None

class Project(ProjectBase):
    id: UUID4
    owner_id: int
    deleted: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DataItemBase(BaseModel):
    input_message: list
    output_message: Optional[list] = None

class DataItemCreate(DataItemBase):
    pass

class DataItemUpdate(BaseModel):
    input_message: Optional[list] = None
    output_message: Optional[list] = None
    deleted: Optional[bool] = None

class DataItem(DataItemBase):
    id: UUID4
    project_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted: bool

    model_config = ConfigDict(from_attributes=True)
