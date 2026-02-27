from database.db import Base, engine
from database.models import Doctor, Patient, Surgery, Medication, Message, RiskLog, EngagementTracking


# Initialize database tables
# Creates all tables defined in models if they don't already exist
def init_db():
    """Create all database tables based on SQLAlchemy models."""
    Base.metadata.create_all(bind=engine)