import pandas as pd
from typing import List, Dict, Any
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from models.fraud import FraudRecord

try:
    from sklearn.ensemble import IsolationForest
    import numpy as np
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def get_fraud_status(db: Session) -> Dict[str, Any]:
    count = db.query(FraudRecord).count()
    return {"has_data": count > 0, "row_count": count}


def get_fraud_insights(db: Session) -> Dict[str, Any]:
    records = db.query(FraudRecord).all()
    if not records:
        return {
            "anomalies_detected": 0,
            "total_transactions": 0,
            "risk_level": "none",
            "alerts": [],
        }

    fraud_records = [r for r in records if r.is_fraud]
    fraud_count = len(fraud_records)
    total = len(records)
    pct = (fraud_count / total * 100) if total > 0 else 0
    risk = "high" if pct > 50 else "medium" if pct > 20 else "low"

    alerts = []
    for i, r in enumerate(fraud_records[:5]):
        alerts.append({
            "id": r.transaction_id,
            "type": "Fraud flagged",
            "score": round(float(r.amount) / 1000 if r.amount else 0.5, 2),
        })

    return {
        "anomalies_detected": fraud_count,
        "total_transactions": total,
        "risk_level": risk,
        "alerts": alerts,
    }


def get_fraud_chart_data(db: Session) -> List[Dict[str, Any]]:
    records = db.query(FraudRecord).all()
    if not records:
        return []
    normal = sum(1 for r in records if not r.is_fraud)
    flagged = sum(1 for r in records if r.is_fraud)
    return [{"day": "Total", "normal": normal, "flagged": flagged}]


def upload_fraud_csv(file: UploadFile, db: Session) -> Dict[str, Any]:
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    try:
        df = pd.read_csv(file.file)
        required_cols = {"transaction_id", "amount", "is_fraud"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {', '.join(required_cols)}")

        db.query(FraudRecord).delete()
        db.commit()

        fraud_count = 0
        normal_count = 0
        seen_tx = set()

        for _, row in df.iterrows():
            tx_id = str(row["transaction_id"])
            if tx_id in seen_tx:
                continue
            seen_tx.add(tx_id)
            is_f = bool(int(row["is_fraud"]))
            item = FraudRecord(transaction_id=tx_id, amount=int(row["amount"]), is_fraud=is_f)
            db.add(item)
            if is_f:
                fraud_count += 1
            else:
                normal_count += 1

        db.commit()
        total = fraud_count + normal_count
        fraud_percentage = round((fraud_count / total * 100) if total > 0 else 0, 1)
        return {"fraud_count": fraud_count, "normal_count": normal_count, "fraud_percentage": fraud_percentage}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
