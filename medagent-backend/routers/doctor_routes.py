from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import Doctor
from typing import List

router = APIRouter(prefix="/doctors", tags=["doctors"])


# POST: Create a new doctor
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_doctor(
    name: str,
    specialization: str = None,
    phone: str = None,
    email: str = None,
    is_available: bool = True,
    db: Session = Depends(get_db),
):
    """Create a new doctor."""
    doctor = Doctor(
        name=name,
        specialization=specialization,
        phone=phone,
        email=email,
        is_available=is_available,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


# GET: Retrieve all doctors
@router.get("/", response_model=List[dict])
def get_all_doctors(db: Session = Depends(get_db)):
    """Retrieve all doctors."""
    doctors = db.query(Doctor).all()
    return [
        {
            "id": doctor.id,
            "name": doctor.name,
            "specialization": doctor.specialization,
            "phone": doctor.phone,
            "email": doctor.email,
            "is_available": doctor.is_available,
            "created_at": doctor.created_at,
        }
        for doctor in doctors
    ]


# GET: Retrieve doctor by ID
@router.get("/{doctor_id}")
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    """Retrieve doctor by ID."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {
        "id": doctor.id,
        "name": doctor.name,
        "specialization": doctor.specialization,
        "phone": doctor.phone,
        "email": doctor.email,
        "is_available": doctor.is_available,
        "created_at": doctor.created_at,
    }


# PUT: Update doctor
@router.put("/{doctor_id}")
def update_doctor(
    doctor_id: int,
    name: str = None,
    specialization: str = None,
    phone: str = None,
    email: str = None,
    is_available: bool = None,
    db: Session = Depends(get_db),
):
    """Update doctor information."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Update fields if provided
    if name is not None:
        doctor.name = name
    if specialization is not None:
        doctor.specialization = specialization
    if phone is not None:
        doctor.phone = phone
    if email is not None:
        doctor.email = email
    if is_available is not None:
        doctor.is_available = is_available

    db.commit()
    db.refresh(doctor)
    return {
        "id": doctor.id,
        "name": doctor.name,
        "specialization": doctor.specialization,
        "phone": doctor.phone,
        "email": doctor.email,
        "is_available": doctor.is_available,
        "created_at": doctor.created_at,
    }


# DELETE: Delete doctor
@router.delete("/{doctor_id}", status_code=status.HTTP_200_OK)
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    """Delete doctor by ID."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    db.delete(doctor)
    db.commit()
    return {"message": f"Doctor {doctor_id} deleted successfully"}