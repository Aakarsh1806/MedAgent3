import os
import sys
import re
from datetime import datetime

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import joinedload
from database.db import SessionLocal
from database.models import Patient, SurgeryReport, Surgery, Medication, RiskLog

def parse_txt(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    patients = []
    blocks = content.split("==================================================")
    for block in blocks:
        block = block.strip()
        if not block:
            continue
            
        patient = {
            'id': None,
            'name': None,
            'age': None,
            'gender': None,
            'medical_overview': {'problem': '', 'symptoms': ''},
            'surgery_report': {'summary': '', 'complications': '', 'recovery_plan': ''},
            'medications': [],
            'risk_logs': [],
        }

        patient_id_match = re.search(r'PATIENT ID:\s*(\d+)', block)
        if patient_id_match:
            patient['id'] = int(patient_id_match.group(1))
        else:
            continue
            
        age_match = re.search(r'Age:\s*(\d+)', block)
        if age_match:
            patient['age'] = int(age_match.group(1))
            
        gender_match = re.search(r'Gender:\s*(.+)', block)
        if gender_match:
            patient['gender'] = gender_match.group(1)
            
        med_prob_match = re.search(r'Medical Problem:\s*(.*?)(?=Symptoms:)', block, re.DOTALL)
        if med_prob_match:
            patient['medical_overview']['problem'] = med_prob_match.group(1).strip()
            
        symptoms_match = re.search(r'Symptoms:\s*(.*?)(?=--------------------------------------------------)', block, re.DOTALL)
        if symptoms_match:
            patient['medical_overview']['symptoms'] = symptoms_match.group(1).strip()
            
        summary_match = re.search(r'Summary:\s*(.*?)(?=Complications:|$)', block, re.DOTALL)
        if summary_match:
            patient['surgery_report']['summary'] = summary_match.group(1).strip()
            
        comp_match = re.search(r'Complications:\s*(.*?)(?=Recovery Plan:|$)', block, re.DOTALL)
        if comp_match:
            patient['surgery_report']['complications'] = comp_match.group(1).strip()
            
        rec_match = re.search(r'Recovery Plan:\s*(.*?)(?=Medications:|RISK LOGS|--------------------------------------------------|$)', block, re.DOTALL)
        if rec_match:
            patient['surgery_report']['recovery_plan'] = rec_match.group(1).strip()
            
        med_block_match = re.search(r'Medications:\s*(.*?)(?=--------------------------------------------------)', block, re.DOTALL)
        if med_block_match:
            med_text = med_block_match.group(1).strip()
            med_items = re.split(r'\n\d+\.\s*', '\n' + med_text)[1:]
            for item in med_items:
                lines = [l.strip() for l in item.split('\n') if l.strip()]
                if not lines: continue
                med_name = lines[0]
                dosage = re.search(r'Dosage:\s*(.+)', item)
                freq = re.search(r'Frequency:\s*(.+)', item)
                status = re.search(r'Status:\s*(.+)', item)
                
                patient['medications'].append({
                    'name': med_name,
                    'dosage': dosage.group(1) if dosage else None,
                    'frequency': freq.group(1) if freq else None,
                    'is_active': (status.group(1).lower() == 'active') if status else True
                })

        risk_block = re.search(r'RISK LOGS\s*(.*?)(?=--------------------------------------------------|$)', block, re.DOTALL)
        if risk_block:
            for rl in risk_block.group(1).strip().split('\n'):
                rl = rl.strip()
                if not rl: continue
                match = re.search(r'\[(.*?)\] Risk Score: ([\d\.]+) \| Escalation: (.*?) \| Pain: ([\d\.]+) \| Symptoms: ([\d\.]+)', rl)
                if match:
                    patient['risk_logs'].append({
                        'timestamp': match.group(1),
                        'risk_score': float(match.group(2)),
                        'escalation_level': match.group(3),
                        'pain_score': float(match.group(4)),
                        'symptom_severity': float(match.group(5)),
                    })
        
        patients.append(patient)
    return patients

def sync_database():
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_patients_database_export.txt")
    parsed_patients = parse_txt(file_path)
    print(f"Parsed {len(parsed_patients)} patients from TXT file.")

    db = SessionLocal()
    try:
        with db.begin():  # Start transaction
            for p_data in parsed_patients:
                patient_id = p_data['id']
                patient = db.query(Patient).options(
                    joinedload(Patient.surgery_report),
                    joinedload(Patient.surgeries),
                    joinedload(Patient.medications),
                    joinedload(Patient.risk_logs)
                ).filter(Patient.id == patient_id).first()
                
                if not patient:
                    print(f"Skipping Patient ID {patient_id} - Not found in DB.")
                    continue
                
                # Update Demographic
                if p_data['age'] is not None:
                    patient.age = p_data['age']
                if p_data['gender'] is not None:
                    patient.gender = p_data['gender']
                    
                # Update/Create SurgeryReport
                sr = patient.surgery_report
                if not sr:
                    sr = SurgeryReport(patient_id=patient.id)
                    db.add(sr)
                
                sr.medical_problem = p_data['medical_overview']['problem']
                sr.symptoms = p_data['medical_overview']['symptoms']
                sr.report_summary = p_data['surgery_report']['summary']
                sr.complications = p_data['surgery_report']['complications']
                sr.recovery_plan = p_data['surgery_report']['recovery_plan']
                
                # Update/Create Surgeries
                surgery_type = 'Unknown'
                match = re.search(r'Procedure Performed:\s*(.*?)(?:\n|$)', p_data['surgery_report']['summary'])
                if match:
                    surgery_type = match.group(1).strip()
                    
                if patient.surgeries:
                    surgery = patient.surgeries[0]
                    surgery.surgery_type = surgery_type
                    surgery.notes = p_data['surgery_report']['summary']
                else:
                    surgery = Surgery(
                        patient_id=patient.id,
                        surgery_type=surgery_type,
                        notes=p_data['surgery_report']['summary']
                    )
                    db.add(surgery)
                    
                # Update Medications
                existing_meds = {m.medicine_name.lower(): m for m in patient.medications}
                processed_med_names = set()
                
                for m_data in p_data['medications']:
                    med_name_lower = m_data['name'].lower()
                    processed_med_names.add(med_name_lower)
                    
                    if med_name_lower in existing_meds:
                        med = existing_meds[med_name_lower]
                        med.dosage = m_data['dosage']
                        med.frequency = m_data['frequency']
                        med.is_active = m_data['is_active']
                    else:
                        med = Medication(
                            patient_id=patient.id,
                            medicine_name=m_data['name'],
                            dosage=m_data['dosage'],
                            frequency=m_data['frequency'],
                            is_active=m_data['is_active']
                        )
                        db.add(med)
                        
                # Remove outdated medications
                for med in patient.medications:
                    if med.medicine_name.lower() not in processed_med_names:
                        db.delete(med)
                        
                # Risk Logs Update
                existing_timestamps = set()
                for rl in patient.risk_logs:
                    ts_str_clean = rl.timestamp.strftime('%Y-%m-%d %H:%M:%S.%f')
                    existing_timestamps.add(ts_str_clean)
                
                for rl_data in p_data['risk_logs']:
                    ts_str = rl_data['timestamp']
                    try:
                        ts_obj = datetime.strptime(ts_str, '%Y-%m-%d %H:%M:%S.%f')
                        ts_formatted = ts_obj.strftime('%Y-%m-%d %H:%M:%S.%f')
                        
                        if ts_formatted not in existing_timestamps:
                            rl = RiskLog(
                                patient_id=patient.id,
                                pain_score=rl_data['pain_score'],
                                symptom_severity=rl_data['symptom_severity'],
                                risk_score=rl_data['risk_score'],
                                escalation_level=rl_data['escalation_level'],
                                timestamp=ts_obj
                            )
                            db.add(rl)
                    except ValueError:
                        pass
        
        print("Database successfully synchronized.")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    sync_database()
