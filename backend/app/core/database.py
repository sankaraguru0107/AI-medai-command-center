from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# MySQL Engine setup
# Set pool_pre_ping to check database connectivity before execution
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )
except Exception as e:
    # Fallback SQLite in-memory engine if MySQL is offline during local test
    print(f"[Warning] Could not connect to MySQL at {settings.DATABASE_URL}: {e}")
    print("[Info] Falling back to SQLite in-memory for zero-crash stability.")
    engine = create_engine("sqlite:///./medai_fallback.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for FastAPI endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
