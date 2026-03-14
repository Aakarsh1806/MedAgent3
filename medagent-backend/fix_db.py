import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "medagent.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE surgery_reports ADD COLUMN medical_problem TEXT")
    print("Added medical_problem column")
except sqlite3.OperationalError as e:
    print(e)

try:
    cursor.execute("ALTER TABLE surgery_reports ADD COLUMN symptoms TEXT")
    print("Added symptoms column")
except sqlite3.OperationalError as e:
    print(e)

conn.commit()
conn.close()
