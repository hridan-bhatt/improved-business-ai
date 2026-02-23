# Create demo user and seed data on startup
from database import SessionLocal
from models.user import User
from core.security import get_password_hash


def init_db():
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "demo@business.ai").first() is None:
            demo = User(
                email="demo@business.ai",
                hashed_password=get_password_hash("demo123"),
                full_name="Demo User",
            )
            db.add(demo)
            db.commit()
    finally:
        db.close()
