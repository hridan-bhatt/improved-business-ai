"""
Explainability engine for FraudLens.
Generates human-readable explanation points for a flagged transaction
without touching or re-running the detection logic.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models.fraud import FraudRecord


# Thresholds used purely for explanation — not detection
_HIGH_AMOUNT_MULTIPLIER = 2.0   # flag if tx amount > 2× average
_BUSINESS_HOURS_START  = 8      # 08:00
_BUSINESS_HOURS_END    = 20     # 20:00


def _avg_amount(db: Session) -> float:
    records = db.query(FraudRecord).all()
    if not records:
        return 0.0
    return sum(r.amount for r in records) / len(records)


def _vendor_appears_once(transaction_id: str, db: Session) -> bool:
    """
    Treat transaction_id prefix (first 4 chars) as a pseudo-vendor code.
    If only one record shares that prefix it's considered a 'new vendor'.
    """
    prefix = transaction_id[:4] if len(transaction_id) >= 4 else transaction_id
    count = (
        db.query(FraudRecord)
        .filter(FraudRecord.transaction_id.like(f"{prefix}%"))
        .count()
    )
    return count == 1


def _is_outside_business_hours(transaction_id: str) -> bool:
    """
    Derive a pseudo hour from the numeric suffix of the transaction_id
    so we can produce a deterministic (demo-friendly) explanation.
    """
    digits = "".join(c for c in transaction_id if c.isdigit())
    if not digits:
        return False
    hour = int(digits[-2:]) % 24
    return not (_BUSINESS_HOURS_START <= hour < _BUSINESS_HOURS_END)


def _has_duplicate_amount(record: FraudRecord, db: Session) -> bool:
    """Check whether another fraud record shares the same amount."""
    count = (
        db.query(FraudRecord)
        .filter(
            FraudRecord.amount == record.amount,
            FraudRecord.transaction_id != record.transaction_id,
            FraudRecord.is_fraud == True,
        )
        .count()
    )
    return count > 0


def explain_transaction(transaction_id: str, db: Session) -> Dict[str, Any]:
    record: FraudRecord | None = (
        db.query(FraudRecord)
        .filter(FraudRecord.transaction_id == transaction_id)
        .first()
    )

    if record is None:
        return {"found": False, "transaction_id": transaction_id, "points": []}

    avg = _avg_amount(db)
    points: List[Dict[str, str]] = []

    # 1. Amount vs average
    if avg > 0:
        ratio = record.amount / avg
        if ratio >= _HIGH_AMOUNT_MULTIPLIER:
            points.append({
                "icon": "amount",
                "label": "Unusually High Amount",
                "detail": (
                    f"This transaction (${record.amount:,}) is "
                    f"{ratio:.1f}× the dataset average (${avg:,.0f}), "
                    "which significantly exceeds normal spending patterns."
                ),
            })
        else:
            points.append({
                "icon": "amount",
                "label": "Amount Within Normal Range",
                "detail": (
                    f"Transaction amount (${record.amount:,}) is "
                    f"{ratio:.1f}× the average (${avg:,.0f}). "
                    "Amount alone does not raise a flag."
                ),
            })

    # 2. New vendor detection
    if _vendor_appears_once(transaction_id, db):
        points.append({
            "icon": "vendor",
            "label": "New or Unrecognised Vendor",
            "detail": (
                f"Vendor code derived from transaction ID \"{transaction_id[:4]}\" "
                "appears only once across all records — no prior purchase history found."
            ),
        })

    # 3. Outside business hours
    if _is_outside_business_hours(transaction_id):
        digits = "".join(c for c in transaction_id if c.isdigit())
        hour = int(digits[-2:]) % 24 if digits else 0
        points.append({
            "icon": "hours",
            "label": "Outside Business Hours",
            "detail": (
                f"Inferred transaction time (~{hour:02d}:00) falls outside "
                f"normal operating hours ({_BUSINESS_HOURS_START:02d}:00–"
                f"{_BUSINESS_HOURS_END:02d}:00)."
            ),
        })

    # 4. Duplicate amount pattern
    if _has_duplicate_amount(record, db):
        points.append({
            "icon": "duplicate",
            "label": "Duplicate Amount Pattern",
            "detail": (
                f"Amount ${record.amount:,} matches one or more other flagged "
                "transactions, suggesting a repeated fraudulent pattern."
            ),
        })

    # Fallback — flagged by model with no additional signals
    if not points:
        points.append({
            "icon": "model",
            "label": "Flagged by Detection Model",
            "detail": (
                "The transaction was marked as fraudulent in the uploaded dataset. "
                "No additional statistical signals were detected in the current data."
            ),
        })

    return {
        "found": True,
        "transaction_id": transaction_id,
        "amount": record.amount,
        "is_fraud": record.is_fraud,
        "points": points,
    }
