from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import MonitoringData

router = APIRouter()

@router.get("/")
def get_monitoring_data(patient_id: str = None, db: Session = Depends(get_db)):
    query = db.query(MonitoringData)
    if patient_id:
        query = query.filter(MonitoringData.patient_id == patient_id)
    return query.order_by(MonitoringData.recorded_at.desc()).limit(50).all()

@router.post("/")
def create_monitoring_entry(data: Dict[str, Any], db: Session = Depends(get_db)):
    entry = MonitoringData(**data)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
