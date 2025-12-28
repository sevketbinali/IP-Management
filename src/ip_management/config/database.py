"""
Database configuration and connection management.

Provides PostgreSQL connection with connection pooling,
transaction management, and environment-based configuration.
"""

import os
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from ..models.database import Base

# Database configuration from environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/ip_management"
)

# Create engine with connection pooling for production use
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Validate connections before use
    pool_recycle=3600,   # Recycle connections every hour
    echo=os.getenv("SQL_DEBUG", "false").lower() == "true"
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Database dependency for FastAPI.
    
    Provides database session with automatic cleanup and transaction management.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database event listeners for audit logging
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Set database connection parameters."""
    # This would be used for SQLite, but we're using PostgreSQL
    pass


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """Drop all database tables (use with caution)."""
    Base.metadata.drop_all(bind=engine)