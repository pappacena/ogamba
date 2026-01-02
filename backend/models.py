import uuid
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON, UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    logto_id = Column(String, unique=True, index=True, nullable=False)

    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    deleted = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="projects")
    data_items = relationship("DataItem", back_populates="project")

class DataItem(Base):
    __tablename__ = "data_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    input_message = Column(JSON, nullable=False)
    output_message = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted = Column(Boolean, default=False)

    project = relationship("Project", back_populates="data_items")
