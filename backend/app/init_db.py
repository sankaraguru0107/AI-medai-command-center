from datetime import datetime, date
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.models import User, Patient, Alert, Bed, Claim, SecurityEvent

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if users already seeded
        if db.query(User).first():
            print("[Init DB] Database already contains initial data.")
            return

        print("[Init DB] Seeding MySQL database with demo clinical data...")

        # 1. Seed Users
        admin = User(
            id="u1",
            email="admin@medai.health",
            name="Dr. Admin Singh",
            role="admin",
            department="Administration"
        )
        doctor = User(
            id="u2",
            email="doctor@medai.health",
            name="Dr. Emily Chen",
            role="doctor",
            department="Internal Medicine",
            npi="1982736450"
        )
        nurse = User(
            id="u3",
            email="nurse@medai.health",
            name="Nurse Patel",
            role="nurse",
            department="ICU"
        )
        ops = User(
            id="u4",
            email="ops@medai.health",
            name="Mark Thompson",
            role="operations",
            department="Operations"
        )
        db.add_all([admin, doctor, nurse, ops])

        # 2. Seed Beds
        beds_data = [
            Bed(id="b1", bed_number="ICU-1", unit="ICU", room="101", floor="2", status="occupied", is_icu=True, has_telemetry=True),
            Bed(id="b2", bed_number="ICU-2", unit="ICU", room="102", floor="2", status="occupied", is_icu=True, has_telemetry=True),
            Bed(id="b3", bed_number="ICU-3", unit="ICU", room="103", floor="2", status="available", is_icu=True, has_telemetry=True),
            Bed(id="b4", bed_number="ICU-4", unit="ICU", room="104", floor="2", status="occupied", is_icu=True, has_telemetry=True),
            Bed(id="b5", bed_number="MS-1", unit="Med/Surg", room="201", floor="3", status="occupied", is_icu=False, has_telemetry=False),
            Bed(id="b6", bed_number="MS-2", unit="Med/Surg", room="202", floor="3", status="available", is_icu=False, has_telemetry=False),
            Bed(id="b7", bed_number="MS-3", unit="Med/Surg", room="203", floor="3", status="cleaning", is_icu=False, has_telemetry=False),
            Bed(id="b8", bed_number="CARD-1", unit="Cardiac", room="301", floor="4", status="occupied", is_icu=False, has_telemetry=True),
        ]
        db.add_all(beds_data)

        # 3. Seed Patients
        patient1 = Patient(
            id="p001",
            mrn="MRN-882910",
            first_name="James",
            last_name="Wilson",
            date_of_birth=date(1965, 4, 12),
            gender="male",
            phone="(555) 234-5678",
            email="j.wilson@example.com",
            blood_type="A+",
            risk_score=85,
            status="active",
            attending_physician_id="u2",
            allergies=["Penicillin", "Sulfa"],
            conditions=["Heart Failure (ICD-10: I50.9)", "Type 2 Diabetes (ICD-10: E11.9)"],
            medications=["Lisinopril 10mg", "Metformin 500mg"]
        )
        patient2 = Patient(
            id="p002",
            mrn="MRN-773419",
            first_name="Sarah",
            last_name="Chen",
            date_of_birth=date(1982, 11, 23),
            gender="female",
            phone="(555) 876-5432",
            email="s.chen@example.com",
            blood_type="O-",
            risk_score=62,
            status="active",
            attending_physician_id="u2",
            allergies=["Codeine"],
            conditions=["Asthma (ICD-10: J45.909)"],
            medications=["Albuterol HFA", "Fluticasone"]
        )
        db.add_all([patient1, patient2])

        # 4. Seed Alerts
        alerts_data = [
            Alert(
                id="a1",
                patient_id="p001",
                type="critical",
                category="vitals",
                title="Critical SpO2 — Bed ICU-4",
                message="Patient SpO2 dropped to 87%. Immediate intervention required.",
                source_system="monitoring",
                priority=1
            ),
            Alert(
                id="a2",
                patient_id="p002",
                type="warning",
                category="medication",
                title="Insulin Dose Overdue",
                message="Scheduled insulin dose 2 hours overdue.",
                source_system="ehr",
                priority=2
            ),
            Alert(
                id="a3",
                patient_id="p001",
                type="critical",
                category="medication",
                title="Drug Interaction Alert",
                message="Warfarin + Amoxicillin co-prescription detected.",
                source_system="ai",
                priority=1
            ),
            Alert(
                id="a4",
                type="warning",
                category="operations",
                title="ICU Capacity 92%",
                message="ICU approaching capacity. Consider diversion protocol.",
                source_system="system",
                priority=2
            ),
        ]
        db.add_all(alerts_data)

        db.commit()
        print("[Init DB] Database initialized successfully!")
    except Exception as e:
        db.rollback()
        print(f"[Init DB Error] Failed to seed database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
