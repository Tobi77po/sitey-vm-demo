"""SİTEY-VM Demo - SQLAlchemy Modelleri (SQLite)"""
import uuid
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, Float
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=True)
    agent_uuid = Column(String, nullable=True)
    scanner = Column(String, nullable=True)
    cve = Column(String, nullable=True)
    risk = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    target_ip = Column(String, nullable=True)
    port = Column(String, nullable=True)
    service = Column(String, nullable=True)
    cvss_score = Column(String, nullable=True)
    status = Column(String, default="open")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    archived = Column(Boolean, default=False)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    archived_by = Column(String, nullable=True)


class ScanJob(Base):
    """OpenVAS tarama işleri."""
    __tablename__ = "scan_jobs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    target = Column(String, nullable=False)
    status = Column(String, default="pending")
    progress = Column(Integer, default=0)
    scanner = Column(String, default="openvas")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    result_count = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
