import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Numeric, Boolean, DateTime, Date, Text, JSON, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="doctor") # admin, doctor, nurse, operations, patient
    department = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    npi = Column(String(50), nullable=True)
    license_number = Column(String(50), nullable=True)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    hashed_password = Column(String(255), nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    mrn = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), default="unknown")
    ssn_last4 = Column(String(4), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(JSON, nullable=True)
    emergency_contact = Column(JSON, nullable=True)
    blood_type = Column(String(10), nullable=True)
    allergies = Column(JSON, default=list)
    conditions = Column(JSON, default=list)
    medications = Column(JSON, default=list)
    status = Column(String(20), default="active")
    admission_date = Column(DateTime, nullable=True)
    discharge_date = Column(DateTime, nullable=True)
    bed_id = Column(String(36), nullable=True)
    attending_physician_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    insurance = Column(JSON, nullable=True)
    risk_score = Column(Integer, default=0)
    risk_factors = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    record_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    structured_data = Column(JSON, nullable=True)
    icd10_codes = Column(JSON, default=list)
    cpt_codes = Column(JSON, default=list)
    ai_summary = Column(Text, nullable=True)
    ai_risk_flags = Column(JSON, default=list)
    ambient_transcript = Column(Text, nullable=True)
    status = Column(String(20), default="draft")
    signed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=True)
    triggered_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    type = Column(String(20), nullable=False) # critical, warning, info, success
    category = Column(String(50), nullable=False) # vitals, medication, lab, security, rcm, operations, imaging, infection
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    source_system = Column(String(100), nullable=True)
    source_id = Column(String(100), nullable=True)
    resolved = Column(Boolean, default=False)
    resolved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    escalated = Column(Boolean, default=False)
    escalated_to = Column(String(36), nullable=True)
    priority = Column(Integer, default=2)
    created_at = Column(DateTime, default=datetime.utcnow)

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    claim_number = Column(String(100), unique=True, nullable=False)
    payer_name = Column(String(255), nullable=False)
    payer_id = Column(String(100), nullable=True)
    member_id = Column(String(100), nullable=True)
    group_number = Column(String(100), nullable=True)
    icd10_primary = Column(String(50), nullable=False)
    icd10_secondary = Column(JSON, default=list)
    cpt_codes = Column(JSON, nullable=False, default=list)
    drg_code = Column(String(50), nullable=True)
    billed_amount = Column(Numeric(12, 2), nullable=False)
    allowed_amount = Column(Numeric(12, 2), nullable=True)
    paid_amount = Column(Numeric(12, 2), nullable=True)
    patient_responsibility = Column(Numeric(12, 2), nullable=True)
    status = Column(String(20), default="draft")
    service_date = Column(Date, nullable=False)
    submission_date = Column(DateTime, nullable=True)
    adjudication_date = Column(DateTime, nullable=True)
    denial_code = Column(String(50), nullable=True)
    denial_reason = Column(Text, nullable=True)
    appeal_deadline = Column(Date, nullable=True)
    ai_validation_score = Column(Integer, nullable=True)
    ai_validation_issues = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Bed(Base):
    __tablename__ = "beds"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bed_number = Column(String(50), nullable=False)
    unit = Column(String(100), nullable=False)
    room = Column(String(50), nullable=True)
    floor = Column(String(50), nullable=True)
    building = Column(String(100), nullable=True)
    status = Column(String(30), default="available") # occupied, available, cleaning, maintenance, reserved, blocked
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=True)
    admission_date = Column(DateTime, nullable=True)
    is_icu = Column(Boolean, default=False)
    is_isolation = Column(Boolean, default=False)
    has_telemetry = Column(Boolean, default=False)
    has_ventilator = Column(Boolean, default=False)
    last_cleaned = Column(DateTime, nullable=True)
    cleaning_requested_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MonitoringData(Base):
    __tablename__ = "monitoring_data"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    heart_rate = Column(Integer, nullable=True)
    spo2 = Column(Numeric(5, 2), nullable=True)
    systolic_bp = Column(Integer, nullable=True)
    diastolic_bp = Column(Integer, nullable=True)
    respiratory_rate = Column(Integer, nullable=True)
    temperature = Column(Numeric(5, 2), nullable=True)
    weight_kg = Column(Numeric(6, 2), nullable=True)
    glucose = Column(Integer, nullable=True)
    pain_score = Column(Integer, nullable=True)
    gcs_score = Column(Integer, nullable=True)
    device_id = Column(String(100), nullable=True)
    source = Column(String(30), default="manual")
    is_abnormal = Column(Boolean, default=False)
    abnormal_flags = Column(JSON, default=list)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(String(36), ForeignKey("users.id"), nullable=True)

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    source_ip = Column(String(50), nullable=True)
    source_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    target_system = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    raw_log = Column(JSON, nullable=True)
    phi_involved = Column(Boolean, default=False)
    hipaa_breach = Column(Boolean, default=False)
    status = Column(String(20), default="open")
    resolved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    phi_accessed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
