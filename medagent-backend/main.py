from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine
from database.models import Base
from database.init_db import init_db
from routers.doctor_routes import router as doctor_router
from routers.patient_routes import router as patient_router
from routers.message_routes import router as message_router
from routers.whatsapp_routes import router as whatsapp_router


# Create FastAPI app
app = FastAPI(title="MedAgent Backend API")

# -----------------------------
# CORS CONFIGURATION (IMPORTANT)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Initialize Database Tables
# -----------------------------
init_db()

# -----------------------------
# Register Routers
# -----------------------------
app.include_router(doctor_router)
app.include_router(patient_router)
app.include_router(message_router)
app.include_router(whatsapp_router)

# -----------------------------
# Root Endpoint
# -----------------------------
@app.get("/")
def read_root():
    return {"message": "MedAgent Backend Running 🚀"}
Base.metadata.create_all(bind=engine)