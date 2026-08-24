from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Claim
from app.schemas.schemas import ClaimResponse, ClaimCreate

router = APIRouter()

@router.get("/", response_model=List[ClaimResponse])
def get_claims(db: Session = Depends(get_db)):
    return db.query(Claim).order_by(Claim.created_at.desc()).all()

@router.post("/", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def create_claim(claim_in: ClaimCreate, db: Session = Depends(get_db)):
    claim = Claim(**claim_in.model_dump())
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim
