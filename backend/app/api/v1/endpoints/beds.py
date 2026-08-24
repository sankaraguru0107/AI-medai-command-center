from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Bed
from app.schemas.schemas import BedResponse

router = APIRouter()

@router.get("/", response_model=List[BedResponse])
def get_beds(db: Session = Depends(get_db)):
    return db.query(Bed).order_by(Bed.bed_number).all()

@router.put("/{bed_id}/status")
def update_bed_status(bed_id: str, status: str, db: Session = Depends(get_db)):
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    bed.status = status
    db.commit()
    db.refresh(bed)
    return bed
