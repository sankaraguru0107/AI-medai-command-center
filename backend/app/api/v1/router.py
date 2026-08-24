from fastapi import APIRouter
from app.api.v1.endpoints import auth, patients, alerts, claims, beds, monitoring, security

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(claims.router, prefix="/claims", tags=["claims"])
api_router.include_router(beds.router, prefix="/beds", tags=["beds"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
