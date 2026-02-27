from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    Text,
    Float,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base


# =========================
# Doctor Model
# =========================
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # One doctor -> Many patients
    patients = relationship(
        "Patient",
        back_populates="doctor",
        cascade="all, delete-orphan",
    )


# =========================
# Patient Model
# =========================
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    emergency_contact = Column(String, nullable=True)

    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    doctor = relationship("Doctor", back_populates="patients")

    surgeries = relationship(
        "Surgery",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    medications = relationship(
        "Medication",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    messages = relationship(
        "Message",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    risk_logs = relationship(
        "RiskLog",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    engagement_tracking = relationship(
        "EngagementTracking",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan",
    )


# =========================
# Surgery Model
# =========================
class Surgery(Base):
    __tablename__ = "surgeries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    surgery_type = Column(String, nullable=False)
    surgery_date = Column(Date, nullable=True)
    hospital = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="surgeries")


# =========================
# Medication Model
# =========================
class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    next_due_time = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="medications")


# =========================
# Message Model
# =========================
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    sender = Column(String, nullable=False)  # patient / bot / doctor
    message_text = Column(Text, nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    severity_score = Column(Float, nullable=True)
    classified_label = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="messages")


# =========================
# RiskLog Model
# =========================
class RiskLog(Base):
    __tablename__ = "risk_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    pain_score = Column(Float, nullable=True)
    symptom_severity = Column(Float, nullable=True)
    medication_adherence = Column(Float, nullable=True)
    engagement_score = Column(Float, nullable=True)

    risk_score = Column(Float, nullable=True)
    escalation_level = Column(String, nullable=True)  # P1, P2, P3

    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="risk_logs")


# =========================
# Engagement Tracking Model
# =========================
class EngagementTracking(Base):
    __tablename__ = "engagement_tracking"

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        primary_key=True,
    )

    last_response_at = Column(DateTime, nullable=True)
    inactivity_level = Column(String, nullable=True)
    reminder_count = Column(Integer, default=0, nullable=False)

    patient = relationship("Patient", back_populates="engagement_tracking")