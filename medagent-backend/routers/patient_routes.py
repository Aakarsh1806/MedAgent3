from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database.db import get_db
from database.models import Patient, Doctor, Surgery, SurgeryReport
from typing import Optional

router = APIRouter(prefix="/patients", tags=["patients"])

# -----------------------------
# POST: Create a new patient
# -----------------------------
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_patient(
    name: str,
    phone: str,
    doctor_id: int,
    age: Optional[int] = None,
    gender: Optional[str] = None,
    emergency_contact: Optional[str] = None,
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    patient = Patient(
        name=name,
        phone=phone,
        doctor_id=doctor_id,
        age=age,
        gender=gender,
        emergency_contact=emergency_contact,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "emergency_contact": patient.emergency_contact,
        "doctor_id": patient.doctor_id,
        "created_at": patient.created_at,
    }


# -----------------------------
# GET: All patients (with doctor + medications)
# -----------------------------
@router.get("/")
def get_patients(
    doctor_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Patient).options(
        joinedload(Patient.medications),   # ✅ Load medications
        joinedload(Patient.doctor),        # ✅ Load doctor
    )

    if doctor_id is not None:
        query = query.filter(Patient.doctor_id == doctor_id)

    patients = query.all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "phone": p.phone,
            "emergency_contact": p.emergency_contact,
            "created_at": p.created_at,

            # ✅ Include doctor details
            "doctor": {
                "id": p.doctor.id,
                "name": p.doctor.name,
                "specialization": p.doctor.specialization,
            } if p.doctor else None,

            # ✅ Include medications
            "medications": [
                {
                    "id": m.id,
                    "medicine_name": m.medicine_name,
                    "dosage": m.dosage,
                    "frequency": m.frequency,
                    "next_due_time": m.next_due_time,
                    "is_active": m.is_active,
                }
                for m in p.medications
            ],
        }
        for p in patients
    ]


# -----------------------------
# GET: Single patient (with relations)
# -----------------------------
@router.get("/{patient_id}")
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = (
        db.query(Patient)
        .options(
            joinedload(Patient.medications),
            joinedload(Patient.doctor),
        )
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "emergency_contact": patient.emergency_contact,
        "created_at": patient.created_at,
        "doctor": {
            "id": patient.doctor.id,
            "name": patient.doctor.name,
            "specialization": patient.doctor.specialization,
        } if patient.doctor else None,
        "medications": [
            {
                "id": m.id,
                "medicine_name": m.medicine_name,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "next_due_time": m.next_due_time,
                "is_active": m.is_active,
            }
            for m in patient.medications
        ],
    }


# -----------------------------
# GET: Full Medical Report (with auto-create SurgeryReport)
# -----------------------------
@router.get("/{patient_id}/full-medical-report")
def get_full_medical_report(patient_id: int, db: Session = Depends(get_db)):
    patient = (
        db.query(Patient)
        .options(
            joinedload(Patient.medications),
            joinedload(Patient.surgeries),
            joinedload(Patient.surgery_report),
        )
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Auto-create SurgeryReport if it doesn't exist
    if not patient.surgery_report:
        new_report = SurgeryReport(
            patient_id=patient.id,
            medical_problem="Pending Medical Evaluation",
            symptoms="None recorded",
            report_summary="No previous surgery reports available. Auto-generated record.",
            complications="None expected.",
            recovery_plan="Standard monitoring.",
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        # We need to refresh the patient to include the newly created report or assign it to the response object.
        # Assigning it directly to avoid another DB query:
        patient.surgery_report = new_report

    # Prepare response payload
    return {
        "patient_info": {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
        },
        "medications": [
            {
                "id": m.id,
                "medicine_name": m.medicine_name,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "next_due_time": m.next_due_time,
                "is_active": m.is_active,
            }
            for m in patient.medications
        ] if patient.medications else [],
        "surgery_details": [
            {
                "id": s.id,
                "surgery_type": s.surgery_type,
                "surgery_date": s.surgery_date,
                "hospital": s.hospital,
                "notes": s.notes,
            }
            for s in patient.surgeries
        ] if patient.surgeries else [],
        "surgery_report": {
            "id": patient.surgery_report.id,
            "medical_problem": patient.surgery_report.medical_problem,
            "symptoms": patient.surgery_report.symptoms,
            "report_summary": patient.surgery_report.report_summary,
            "complications": patient.surgery_report.complications,
            "recovery_plan": patient.surgery_report.recovery_plan,
        }
    }


# -----------------------------
# DELETE: Remove patient
# -----------------------------
@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    db.delete(patient)
    db.commit()

    return {"message": "Patient deleted successfully"}