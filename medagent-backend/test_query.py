import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database.db import SessionLocal
from database.models import Patient
from sqlalchemy.orm import joinedload

db = SessionLocal()
try:
    patient = (
        db.query(Patient)
        .options(
            joinedload(Patient.medications),
            joinedload(Patient.surgeries),
            joinedload(Patient.surgery_report),
        )
        .filter(Patient.id == 1)
        .first()
    )
    print(patient)
    if patient.surgery_report:
        print(patient.surgery_report.id)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
