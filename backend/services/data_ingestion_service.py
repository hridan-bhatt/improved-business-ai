# Centralized data ingestion orchestrator
import io
from typing import Dict, Any, Tuple

import pandas as pd
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from services.schema_validator import validate_schema
from services.data_normalizer import normalize
from models.expense import ExpenseItem
from models.fraud import FraudRecord
from models.inventory import InventoryItem
from models.green_grid import GreenGridRecord


def _store_expense(df: pd.DataFrame, db: Session) -> Tuple[int, int]:
    """Insert expense rows. Returns (processed, failed)."""
    processed = 0
    failed = 0
    for _, row in df.iterrows():
        try:
            item = ExpenseItem(
                category=str(row.get("category", "")),
                amount=float(row.get("amount", 0)),
                month=str(row.get("month", "")),
            )
            db.add(item)
            processed += 1
        except Exception:
            failed += 1
    return processed, failed


def _store_fraud(df: pd.DataFrame, db: Session) -> Tuple[int, int]:
    """Insert/merge fraud rows. Returns (processed, failed)."""
    processed = 0
    failed = 0
    for _, row in df.iterrows():
        try:
            item = FraudRecord(
                transaction_id=str(row.get("transaction_id", "")),
                amount=int(float(row.get("amount", 0))),
                is_fraud=bool(row.get("is_fraud", False)),
            )
            db.merge(item)
            processed += 1
        except Exception:
            failed += 1
    return processed, failed


def _store_inventory(df: pd.DataFrame, db: Session) -> Tuple[int, int]:
    """Insert/update inventory rows. Returns (processed, failed)."""
    processed = 0
    failed = 0
    for _, row in df.iterrows():
        try:
            item_name = str(row.get("item_name", "")).strip()
            if not item_name:
                failed += 1
                continue

            category = str(row.get("category", "")).strip()
            quantity = int(row.get("quantity", 0))
            price = float(row.get("price", 0.0))

            existing = db.query(InventoryItem).filter(
                InventoryItem.item_name == item_name
            ).first()

            if existing:
                existing.quantity = quantity
                existing.price = price
                existing.category = category
            else:
                db.add(InventoryItem(
                    item_name=item_name,
                    category=category,
                    quantity=quantity,
                    price=price,
                ))
            processed += 1
        except Exception:
            failed += 1
    return processed, failed


def _store_energy(df: pd.DataFrame, db: Session) -> Tuple[int, int]:
    """Insert energy/green-grid rows. Returns (processed, failed)."""
    processed = 0
    failed = 0
    for _, row in df.iterrows():
        try:
            item = GreenGridRecord(
                hour=str(row.get("hour", "")),
                usage_kwh=float(row.get("usage_kwh", 0)),
            )
            db.add(item)
            processed += 1
        except Exception:
            failed += 1
    return processed, failed


_STORE_FNS = {
    "expense_data": _store_expense,
    "fraud_data": _store_fraud,
    "inventory_data": _store_inventory,
    "energy_data": _store_energy,
}


def ingest_csv(
    file: UploadFile,
    dataset_type: str,
    db: Session,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Centralized CSV ingestion pipeline.

    1. Validate file extension
    2. Read CSV into DataFrame
    3. Validate schema (new or legacy columns)
    4. Normalize data
    5. Store in database
    6. Return (cleaned_df, result_dict)

    The caller (module service) can use cleaned_df for aggregation logic.
    """
    # 1. File extension check
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    # 2. Read CSV
    try:
        content = file.file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse CSV file: {str(e)}",
        )

    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV file is empty.",
        )

    # 3. Validate schema
    is_valid, schema_name, missing = validate_schema(df, dataset_type)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required columns: {', '.join(sorted(missing))}",
        )

    # 4. Normalize
    df = normalize(df, dataset_type, schema_name)

    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="No valid rows remain after data cleaning.",
        )

    # 5. Store
    store_fn = _STORE_FNS.get(dataset_type)
    if not store_fn:
        raise HTTPException(
            status_code=500,
            detail=f"No storage handler for dataset type: {dataset_type}",
        )

    try:
        processed, failed = store_fn(df, db)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store data: {str(e)}",
        )

    # 6. Build result
    result = {
        "success": True,
        "records_processed": processed,
        "records_failed": failed,
        "dataset_type": dataset_type,
    }

    return df, result
