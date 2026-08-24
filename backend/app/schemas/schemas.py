from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    email: str
    name: str
    role: str
    department: Optional[str] = None
    phone: Optional[str] = None
    npi: Optional[str] = None
    license_number: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = "password123"

class UserResponse(UserBase):
    id: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Login Schema
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Patient Schemas
class PatientBase(BaseModel):
    mrn: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Optional[str] = "unknown"
    ssn_last4: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    blood_type: Optional[str] = None
    status: Optional[str] = "active"
    risk_score: Optional[int] = 0

class PatientCreate(PatientBase):
    address: Optional[Dict[str, Any]] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    allergies: Optional[List[Any]] = []
    conditions: Optional[List[Any]] = []
    medications: Optional[List[Any]] = []
    insurance: Optional[Dict[str, Any]] = None
    risk_factors: Optional[List[Any]] = []

class PatientResponse(PatientBase):
    id: str
    address: Optional[Dict[str, Any]] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    allergies: Optional[List[Any]] = []
    conditions: Optional[List[Any]] = []
    medications: Optional[List[Any]] = []
    insurance: Optional[Dict[str, Any]] = None
    risk_factors: Optional[List[Any]] = []
    admission_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    type: str
    category: str
    title: str
    message: str
    priority: Optional[int] = 2

class AlertCreate(AlertBase):
    patient_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    source_system: Optional[str] = "system"

class AlertResponse(AlertBase):
    id: str
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    resolved: bool = False
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Claim Schemas
class ClaimBase(BaseModel):
    claim_number: str
    payer_name: str
    icd10_primary: str
    billed_amount: float
    service_date: date
    status: Optional[str] = "draft"

class ClaimCreate(ClaimBase):
    patient_id: str
    cpt_codes: List[Any] = []
    ai_validation_score: Optional[int] = 95

class ClaimResponse(ClaimBase):
    id: str
    patient_id: str
    cpt_codes: List[Any] = []
    allowed_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    ai_validation_score: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Bed Schemas
class BedBase(BaseModel):
    bed_number: str
    unit: str
    room: Optional[str] = None
    floor: Optional[str] = None
    status: Optional[str] = "available"
    is_icu: Optional[bool] = False
    has_telemetry: Optional[bool] = False

class BedResponse(BedBase):
    id: str
    patient_id: Optional[str] = None
    last_cleaned: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
