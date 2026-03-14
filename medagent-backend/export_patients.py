import os
import sys

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import joinedload
from database.db import SessionLocal
from database.models import Patient

def export_all_patients():
    db = SessionLocal()
    try:
        patients = (
            db.query(Patient)
            .options(
                joinedload(Patient.doctor),
                joinedload(Patient.surgeries),
                joinedload(Patient.surgery_report),
                joinedload(Patient.medications),
                joinedload(Patient.risk_logs),
                joinedload(Patient.messages),
                joinedload(Patient.engagement_tracking)
            )
            .order_by(Patient.id)
            .all()
        )
        
        output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_patients_database_export.txt")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            for patient in patients:
                f.write("==================================================\n")
                f.write(f"PATIENT ID: {patient.id}\n")
                f.write(f"Name: {patient.name}\n")
                if patient.age is not None:
                    f.write(f"Age: {patient.age}\n")
                if patient.gender:
                    f.write(f"Gender: {patient.gender}\n")
                doctor_name = patient.doctor.name if patient.doctor else "None"
                f.write(f"Doctor: {doctor_name}\n")
                # Intentionally omitting Ward and Status as they do not exist in the DB, fulfilling "Only extract existing database content" and "Do NOT use placeholder values"

                f.write("--------------------------------------------------\n")
                f.write("MEDICAL OVERVIEW\n")
                if patient.surgery_report:
                    f.write("Medical Problem:\n")
                    f.write(f"{patient.surgery_report.medical_problem or ''}\n\n")
                    f.write("Symptoms:\n")
                    f.write(f"{patient.surgery_report.symptoms or ''}\n")
                else:
                    f.write("Medical Problem:\n\nSymptoms:\n")
                
                f.write("\n--------------------------------------------------\n")
                f.write("SURGERY REPORT\n")
                if patient.surgery_report:
                    f.write("Summary:\n")
                    f.write(f"{patient.surgery_report.report_summary or ''}\n\n")
                    f.write("Complications:\n")
                    f.write(f"{patient.surgery_report.complications or ''}\n\n")
                    f.write("Recovery Plan:\n")
                    f.write(f"{patient.surgery_report.recovery_plan or ''}\n")
                else:
                    f.write("Summary:\n\nComplications:\n\nRecovery Plan:\n")

                f.write("\n--------------------------------------------------\n")
                f.write("MEDICATIONS\n")
                if patient.medications:
                    for idx, med in enumerate(patient.medications, 1):
                        f.write(f"{idx}. {med.medicine_name}\n")
                        f.write(f"   Dosage: {med.dosage or ''}\n")
                        f.write(f"   Frequency: {med.frequency or ''}\n")
                        status = "Active" if med.is_active else "Inactive"
                        f.write(f"   Status: {status}\n")
                        if idx < len(patient.medications):
                            f.write("\n")
                else:
                    f.write("\n")
                
                f.write("\n--------------------------------------------------\n")
                f.write("RISK LOGS\n")
                sorted_risk_logs = sorted(patient.risk_logs, key=lambda x: x.timestamp) if patient.risk_logs else []
                if sorted_risk_logs:
                    for log in sorted_risk_logs:
                        f.write(f"[{log.timestamp}] Risk Score: {log.risk_score} | Escalation: {log.escalation_level} | Pain: {log.pain_score} | Symptoms: {log.symptom_severity}\n")
                else:
                    f.write("\n")

                f.write("\n--------------------------------------------------\n")
                f.write("MESSAGES\n")
                sorted_messages = sorted(patient.messages, key=lambda x: x.timestamp) if patient.messages else []
                if sorted_messages:
                    for msg in sorted_messages:
                        sender = msg.sender.capitalize() if msg.sender else "Unknown"
                        f.write(f"[{msg.timestamp}] {sender}: {msg.message_text}\n")
                else:
                    f.write("\n")
                
                f.write("\n--------------------------------------------------\n")
                f.write("ENGAGEMENT\n")
                if patient.engagement_tracking:
                    f.write(f"Last Response: {patient.engagement_tracking.last_response_at or ''}\n")
                    f.write(f"Inactivity Level: {patient.engagement_tracking.inactivity_level or ''}\n")
                    f.write(f"Reminder Count: {patient.engagement_tracking.reminder_count}\n")
                else:
                    f.write("Last Response:\n")
                    f.write("Inactivity Level:\n")
                    f.write("Reminder Count:\n")
                
                f.write("\n")
                
        print(f"Export successful. Wrote {len(patients)} patients to {output_file}")
    finally:
        db.close()

if __name__ == "__main__":
    export_all_patients()
