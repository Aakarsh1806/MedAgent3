from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.db import get_db
from database.models import Patient, Message

router = APIRouter(prefix="/webhook", tags=["webhook"])


# Pydantic model for request body
class WhatsAppPayload(BaseModel):
    from_number: str
    message_body: str


@router.post("/whatsapp", status_code=status.HTTP_200_OK)
def whatsapp_webhook(
    payload: WhatsAppPayload,
    db: Session = Depends(get_db),
):
    """
    Receive incoming WhatsApp payload,
    store patient message,
    generate and store bot reply.
    """

    # Locate patient by phone number
    patient = db.query(Patient).filter(Patient.phone == payload.from_number).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # Store incoming patient message
    patient_msg = Message(
        patient_id=patient.id,
        sender="patient",
        message_text=payload.message_body,
    )
    db.add(patient_msg)

    # Prepare bot reply
    bot_reply_text = "Message received. Our system is processing your request."

    bot_msg = Message(
        patient_id=patient.id,
        sender="bot",
        message_text=bot_reply_text,
    )
    db.add(bot_msg)

    db.commit()

    return {"reply": bot_reply_text}