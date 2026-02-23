# Core configuration
import os
from typing import Optional

SECRET_KEY = os.getenv("SECRET_KEY", "hackathon-demo-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DATABASE_URL = "sqlite:///./business_ai.db"
