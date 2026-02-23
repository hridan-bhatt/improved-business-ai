# Expense Sense: simple categorization and trends (rule-based + optional sklearn)
import random
import pandas as pd
from typing import List, Dict, Any
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from models.expense import ExpenseItem

def get_expense_status(db: Session) -> Dict[str, Any]:
    count = db.query(ExpenseItem).count()
    return {"has_data": count > 0, "row_count": count}


# Mock expense data for demo
def get_expense_summary(db: Session = None) -> Dict[str, Any]:
    categories = ["Operations", "Marketing", "R&D", "Salaries", "Utilities", "Travel"]
    data = [{"name": c, "value": random.randint(5, 35)} for c in categories]
    total = sum(d["value"] for d in data)
    return {
        "by_category": data,
        "total": total,
        "trend": "up" if random.random() > 0.5 else "down",
        "trend_percent": round(random.uniform(-8, 12), 1),
    }


def get_expense_trend_data(db: Session = None) -> List[Dict[str, Any]]:
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return [{"month": m, "amount": random.randint(20, 80)} for m in months]

def upload_expense_csv(file: UploadFile, db: Session) -> Dict[str, Any]:
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
        
    try:
        df = pd.read_csv(file.file)
        
        required_cols = {"category", "amount", "month"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(
                status_code=400, 
                detail=f"CSV must contain columns: {', '.join(required_cols)}"
            )
            
        inserted = 0
        for _, row in df.iterrows():
            item = ExpenseItem(
                category=str(row["category"]),
                amount=float(row["amount"]),
                month=str(row["month"])
            )
            db.add(item)
            inserted += 1
            
        db.commit()
        
        # Aggregate logic
        by_category = df.groupby("category")["amount"].sum()
        labels = by_category.index.tolist()
        values = by_category.values.tolist()
        total = sum(values)
        
        trends_df = df.groupby("month")["amount"].sum()
        trends = [{"month": str(m), "amount": float(a)} for m, a in trends_df.items()]
        
        return {
            "labels": labels,
            "values": values,
            "total": total,
            "trends": trends,
            "trend": "up",
            "trend_percent": 5.0
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
