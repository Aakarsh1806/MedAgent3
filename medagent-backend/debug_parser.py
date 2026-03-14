import os
from import_patients import parse_txt

file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_patients_database_export.txt")
patients = parse_txt(file_path)

print(f"Total parsed: {len(patients)}")
p = patients[22] # Patient ID 23
print(f"ID: {p['id']}, Name: {p['name']}")
print(f"Medical Problem: {repr(p['medical_overview']['problem'])[:100]}")
print(f"Surgery Summary: {repr(p['surgery_report']['summary'])[:100]}")
print(f"Complications: {repr(p['surgery_report']['complications'])[:100]}")
print(f"Medications count: {len(p['medications'])}")
print(p['medications'])
