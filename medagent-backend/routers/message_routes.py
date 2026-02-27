from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import Message, Patient

router = APIRouter(prefix="/messages", tags=["messages"])


# POST: create a new message for a patient
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_message(
    patient_id: int,
    sender: str,
    message_text: str,
    severity_score: float = None,
    classified_label: str = None,
    db: Session = Depends(get_db),
):
    """Store a new message. Patient must exist."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    msg = Message(
        patient_id=patient_id,
        sender=sender,
        message_text=message_text,
        severity_score=severity_score,
        classified_label=classified_label,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# GET: all messages for a given patient, ordered by timestamp
@router.get("/{patient_id}")
def get_messages(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve messages for a patient (oldest first)."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    messages = (
        db.query(Message)
        .filter(Message.patient_id == patient_id)
        .order_by(Message.timestamp.asc())
        .all()
    )
    return messages


# DELETE: remove a specific message
@router.delete("/{message_id}", status_code=status.HTTP_200_OK)
def delete_message(message_id: int, db: Session = Depends(get_db)):
    """Delete a message by id."""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    db.delete(msg)
    db.commit()
    return {"message": f"Message {message_id} deleted successfully"}
