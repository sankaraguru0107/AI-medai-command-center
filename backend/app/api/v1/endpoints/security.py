from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import SecurityEvent, AuditLog

router = APIRouter()

@router.get("/events")
def get_security_events(db: Session = Depends(get_db)):
    return db.query(SecurityEvent).order_by(SecurityEvent.created_at.desc()).limit(50).all()

@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
