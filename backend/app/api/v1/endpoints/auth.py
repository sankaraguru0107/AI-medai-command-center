from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import LoginRequest, TokenResponse, UserResponse, UserCreate

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Auto-create user if in dev/demo mode for seamless onboarding
        role = "admin" if "admin" in request.email else "doctor"
        name = "Dr. " + request.email.split("@")[0].title()
        user = User(
            email=request.email,
            name=name,
            role=role,
            department="Clinical Intelligence"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return TokenResponse(
        access_token=f"demo-token-{user.id}",
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(email: str = "admin@medai.health", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name="Dr. Admin Singh", role="admin", department="Administration")
        db.add(user)
        db.commit()
        db.refresh(user)
    return UserResponse.model_validate(user)
