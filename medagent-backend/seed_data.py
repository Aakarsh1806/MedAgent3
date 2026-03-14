import sys
import os
from datetime import datetime, timedelta, date
import random

# Ensure the app directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db import SessionLocal, engine, Base
from database.models import (
    Doctor,
    Patient,
    Medication,
    Surgery,
    SurgeryReport,
    RiskLog,
    Message,
    EngagementTracking,
)

def seed_data():
    print("🚀 Starting database seeding process...")
    
    # Ensure tables are created (including the new SurgeryReport)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. DOCTORS (5)
        doctors_data = [
            {"name": "Dr. Sarah Taylor", "specialization": "Cardiology", "phone": "555-0101", "email": "sarah.taylor@medagent.com"},
            {"name": "Dr. James Wilson", "specialization": "Neurology", "phone": "555-0102", "email": "james.wilson@medagent.com"},
            {"name": "Dr. Emily Chen", "specialization": "Orthopedics", "phone": "555-0103", "email": "emily.chen@medagent.com"},
            {"name": "Dr. Michael Brown", "specialization": "Pediatrics", "phone": "555-0104", "email": "michael.brown@medagent.com"},
            {"name": "Dr. Lisa Anderson", "specialization": "General Surgery", "phone": "555-0105", "email": "lisa.anderson@medagent.com"},
        ]

        doctors = []
        for d_data in doctors_data:
            # Prevent duplicate inserts based on email
            doctor = db.query(Doctor).filter(Doctor.email == d_data["email"]).first()
            if not doctor:
                doctor = Doctor(**d_data, is_available=True)
                db.add(doctor)
                db.commit()
                db.refresh(doctor)
            doctors.append(doctor)

        print(f"✅ Doctors seeded: {len(doctors)}")

        # 2. PATIENTS (30 total, 6 per doctor)
        # Check if we already seeded patients for this batch of doctors
        patients = []
        patient_count_needed = 30
        current_patients_count = db.query(Patient).count()
        
        if current_patients_count < patient_count_needed:
            first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Victor", "Peggy"]
            last_names = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson"]

            for doctor in doctors:
                # 6 patients per doctor
                for i in range(6):
                    name = f"{random.choice(first_names)} {random.choice(last_names)}"
                    # Avoid exact name duplication just in case
                    existing = db.query(Patient).filter(Patient.name == name, Patient.doctor_id == doctor.id).first()
                    if not existing:
                        patient = Patient(
                            name=name,
                            age=random.randint(18, 85),
                            gender=random.choice(["Male", "Female", "Other"]),
                            phone=f"555-02{doctor.id:02d}{i:02d}",
                            emergency_contact=f"555-03{doctor.id:02d}{i:02d}",
                            doctor_id=doctor.id
                        )
                        db.add(patient)
                        db.commit()
                        db.refresh(patient)
                        patients.append(patient)
                    else:
                        patients.append(existing)
            print(f"✅ Patients seeded: {len(patients)} for demo purposes")
        else:
            patients = db.query(Patient).limit(30).all()
            print(f"ℹ️ Patients already exist, using existing {len(patients)} patients")

        # 3. Medications (2 per patient)
        meds_count = db.query(Medication).count()
        if meds_count < len(patients) * 2:
            med_names = ["Aspirin", "Ibuprofen", "Amoxicillin", "Lisinopril", "Metformin", "Atorvastatin", "Amlodipine", "Albuterol", "Omeprazole", "Losartan"]
            for patient in patients:
                # check existing meds
                existing_meds = db.query(Medication).filter(Medication.patient_id == patient.id).count()
                for _ in range(2 - existing_meds):
                    med = Medication(
                        patient_id=patient.id,
                        medicine_name=random.choice(med_names),
                        dosage=f"{random.choice([10, 20, 50, 100, 250, 500])}mg",
                        frequency=random.choice(["Once daily", "Twice daily", "Every 8 hours", "As needed"]),
                        next_due_time=datetime.utcnow() + timedelta(hours=random.randint(1, 24)),
                        is_active=True
                    )
                    db.add(med)
            db.commit()
            print("✅ Medications seeded")
        else:
            print("ℹ️ Medications already exist")
        
        # 4. Surgeries & 5. Surgery Reports (1 per patient)
        surg_count = db.query(Surgery).count()
        if surg_count < len(patients):
            surgery_types = ["Appendectomy", "Knee Replacement", "Cataract Surgery", "Hernia Repair", "Gallbladder Removal", "Heart Bypass", "Hip Replacement"]
            for patient in patients:
                existing_surg = db.query(Surgery).filter(Surgery.patient_id == patient.id).first()
                if not existing_surg:
                    surgery = Surgery(
                        patient_id=patient.id,
                        surgery_type=random.choice(surgery_types),
                        surgery_date=date.today() - timedelta(days=random.randint(10, 365)),
                        hospital="MedAgent Central Hospital",
                        notes="Patient recovering well."
                    )
                    db.add(surgery)
                    db.commit()
                    db.refresh(surgery)

                    report = SurgeryReport(
                        patient_id=patient.id,
                        report_summary=f"Successful {surgery.surgery_type} with standard protocol.",
                        complications="None expected." if random.random() > 0.2 else "Minor fever post-op.",
                        recovery_plan="Rest for 2 weeks, avoid heavy lifting."
                    )
                    db.add(report)
            db.commit()
            print("✅ Surgeries and Surgery Reports seeded")
        else:
            print("ℹ️ Surgeries and Reports already exist")

        # 6. RiskLogs (3 per patient)
        risk_count = db.query(RiskLog).count()
        if risk_count < len(patients) * 3:
            for patient in patients:
                existing_risks = db.query(RiskLog).filter(RiskLog.patient_id == patient.id).count()
                for i in range(3 - existing_risks):
                    pain = random.randint(1, 10)
                    symptom = random.randint(1, 10)
                    adherence = random.randint(50, 100)
                    engagement = random.randint(1, 100)
                    
                    # Ensure derivation: (pain + symptom + (100 - adherence)/100 + engagement) normalized
                    raw_score = pain + symptom + (100 - adherence)/100 + engagement
                    # Max possible: 10 + 10 + 0.5 + 100 = 120.5 -> let's normalize to 0-100
                    risk_score = min(100.0, raw_score / 120.5 * 100.0)
                    
                    if risk_score > 75:
                        escalation_level = "P1"
                    elif risk_score > 40:
                        escalation_level = "P2"
                    else:
                        escalation_level = "P3"

                    risk_log = RiskLog(
                        patient_id=patient.id,
                        pain_score=pain,
                        symptom_severity=symptom,
                        medication_adherence=adherence,
                        engagement_score=engagement,
                        risk_score=risk_score,
                        escalation_level=escalation_level,
                        timestamp=datetime.utcnow() - timedelta(days=i*7)
                    )
                    db.add(risk_log)
            db.commit()
            print("✅ RiskLogs seeded")
        else:
            print("ℹ️ RiskLogs already exist")

        # 7. Messages (2 per patient)
        msg_count = db.query(Message).count()
        if msg_count < len(patients) * 2:
            for patient in patients:
                existing_msgs = db.query(Message).filter(Message.patient_id == patient.id).count()
                if existing_msgs == 0:
                    msg1 = Message(
                        patient_id=patient.id,
                        sender="patient",
                        message_text="I have been feeling a bit dizzy today.",
                        timestamp=datetime.utcnow() - timedelta(days=1),
                        severity_score=6.5,
                        classified_label="Symptom Check"
                    )
                    msg2 = Message(
                        patient_id=patient.id,
                        sender="bot",
                        message_text="I've noted that. Please rest and drink water. I will notify your doctor if it persists.",
                        timestamp=datetime.utcnow() - timedelta(days=1, minutes=-5),
                        severity_score=1.0,
                        classified_label="Advice"
                    )
                    db.add_all([msg1, msg2])
            db.commit()
            print("✅ Messages seeded")
        else:
            print("ℹ️ Messages already exist")

        # 8. EngagementTracking (1 per patient)
        eng_count = db.query(EngagementTracking).count()
        if eng_count < len(patients):
            for patient in patients:
                existing_eng = db.query(EngagementTracking).filter(EngagementTracking.patient_id == patient.id).first()
                if not existing_eng:
                    tracking = EngagementTracking(
                        patient_id=patient.id,
                        last_response_at=datetime.utcnow() - timedelta(days=random.randint(1, 5)),
                        inactivity_level=random.choice(["Low", "Medium", "High"]),
                        reminder_count=random.randint(0, 5)
                    )
                    db.add(tracking)
            db.commit()
            print("✅ EngagementTracking seeded")
        else:
            print("ℹ️ EngagementTracking already exist")

        print("🎉 Database successfully seeded with safe, realistic demo data!")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
