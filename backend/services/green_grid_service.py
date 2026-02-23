# Smart Green Grid Optimizer: energy/savings suggestions (rule-based)
import random
import pandas as pd
from typing import List, Dict, Any
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from models.green_grid import GreenGridRecord


def get_green_grid_status(db: Session) -> Dict[str, Any]:
    count = db.query(GreenGridRecord).count()
    return {"has_data": count > 0, "row_count": count}


def get_green_grid_data(db: Session = None) -> Dict[str, Any]:
    return {
        "current_usage_kwh": round(random.uniform(1200, 1800), 1),
        "suggested_peak_shift": round(random.uniform(5, 15), 1),
        "potential_savings_percent": round(random.uniform(8, 20), 1),
        "recommendations": [
            "Shift heavy loads to off-peak hours",
            "Enable smart thermostat schedules",
            "Consider solar for daytime load",
        ],
    }


def get_energy_chart_data(db: Session = None) -> List[Dict[str, Any]]:
    return [
        {"hour": f"{h}:00", "usage": random.randint(30, 90)}
        for h in range(8, 20)
    ]

def upload_green_csv(file: UploadFile, db: Session) -> Dict[str, Any]:
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
        
    try:
        df = pd.read_csv(file.file)
        
        required_cols = {"hour", "usage_kwh"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(
                status_code=400, 
                detail=f"CSV must contain columns: {', '.join(required_cols)}"
            )
            
        inserted = 0
        for _, row in df.iterrows():
            item = GreenGridRecord(
                hour=str(row["hour"]),
                usage_kwh=float(row["usage_kwh"])
            )
            db.add(item)
            inserted += 1
            
        db.commit()
        
        # Aggregate logic for frontend chart
        # Average usage per hour across multiple days if they exist
        by_hour = df.groupby("hour")["usage_kwh"].mean()
        # Sort hours appropriately if needed, but mean retains grouping
        labels = by_hour.index.tolist()
        values = [round(v, 2) for v in by_hour.values.tolist()]
        average = round(sum(values) / len(values), 2) if values else 0.0
        
        return {
            "labels": labels,
            "values": values,
            "average": average
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
