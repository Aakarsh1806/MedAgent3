import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from typing import Generator

# Database URL configuration
# SQLite database file location (root of project)
DATABASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'medagent.db')}"

# Engine configuration
# connect_args={"check_same_thread": False} required for SQLite with FastAPI
# poolclass=StaticPool ensures compatibility with SQLite threading
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Session factory for creating database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base for defining ORM models
Base = declarative_base()


# FastAPI dependency function to inject database session
def get_db() -> Generator:
    """
    Provides database session to FastAPI routes.
    Automatically closes session after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()