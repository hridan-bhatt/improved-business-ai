# FastAPI app: CORS, routers, demo data init
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from database import Base
from services.demo_data import init_db
from models.inventory import InventoryItem
from models.expense import ExpenseItem
from models.fraud import FraudRecord
from models.green_grid import GreenGridRecord
from routers import auth, expense, fraud, inventory, green_grid, health, recommendations, carbon, report, chat

app = FastAPI(title="Business AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables and demo user
Base.metadata.create_all(bind=engine)
init_db()

app.include_router(auth.router)
app.include_router(expense.router)
app.include_router(fraud.router)
app.include_router(inventory.router)
app.include_router(green_grid.router)
app.include_router(health.router)
app.include_router(recommendations.router)
app.include_router(carbon.router)
app.include_router(report.router)
app.include_router(chat.router)


@app.get("/health")
def api_health():
    return {"status": "ok"}
