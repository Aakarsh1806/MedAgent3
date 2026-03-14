import os
import sys
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import joinedload
from database.db import SessionLocal
from database.models import Patient

def verify_import():
    db = SessionLocal()
    try:
        patients = db.query(Patient).options(
            joinedload(Patient.surgery_report),
            joinedload(Patient.surgeries),
            joinedload(Patient.medications)
        ).all()
        
        sample = random.sample(patients, min(3, len(patients)))
        for p in sample:
            print("="*40)
            print(f"Patient ID: {p.id} Name: {p.name}")
            if p.surgery_report:
                safe_problem = (p.surgery_report.medical_problem or '')[:100].replace('\n', ' ')
                safe_comp = (p.surgery_report.complications or '')[:100].replace('\n', ' ')
                print(f"Medical Problem: {safe_problem}...")
                print(f"Complications: {safe_comp}...")
            else:
                print("No Surgery Report found.")
                
            if p.surgeries:
                print(f"Surgery Type: {p.surgeries[0].surgery_type}")
            else:
                print("No Surgeries found.")
                
            print(f"Medications ({len(p.medications)}):")
            for m in p.medications:
                print(f"  - {m.medicine_name} ({m.dosage}) - Active: {m.is_active}")
            print("="*40)
    finally:
        db.close()

if __name__ == "__main__":
    verify_import()
