# Smart Inventory AI: reorder suggestions (rule-based + optional LinearRegression)
import random
import io
from typing import List, Dict, Any
from fastapi import UploadFile, HTTPException

try:
    from sklearn.linear_model import LinearRegression
    import numpy as np
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False

from sqlalchemy.orm import Session
from models.inventory import InventoryItem

def get_inventory_status(db: Session) -> Dict[str, Any]:
    count = db.query(InventoryItem).count()
    return {"has_data": count > 0, "row_count": count}


def get_inventory_summary(db: Session = None) -> Dict[str, Any]:
    items = []
    if db is not None:
        db_items = db.query(InventoryItem).all()
        for i in db_items:
            # We use 30 as a default reorder_at since the model only has quantity
            items.append({"name": i.item_name, "stock": i.quantity, "reorder_at": 30})
            
    # Fallback to mock data if no items exist to not break existing UI expectations
    if not items:
        items = [
            {"name": "Widget A", "stock": random.randint(10, 80), "reorder_at": 30},
            {"name": "Widget B", "stock": random.randint(5, 40), "reorder_at": 20},
            {"name": "Widget C", "stock": random.randint(50, 150), "reorder_at": 50},
        ]
        
    low_stock = [i for i in items if i["stock"] < i["reorder_at"]]
    return {
        "items": items,
        "low_stock_count": len(low_stock),
        "suggestions": [f"Reorder {i['name']} soon" for i in low_stock[:3]],
    }


def get_inventory_forecast() -> List[Dict[str, Any]]:
    if HAS_SKLEARN:
        np.random.seed(42)
        X = np.array([[i] for i in range(10)])
        y = 100 - np.cumsum(np.random.rand(10) * 5)
        model = LinearRegression().fit(X, y)
        future = np.array([[i] for i in range(10, 14)])
        pred = model.predict(future)
        return [{"week": f"W{i}", "predicted_stock": max(0, round(p, 1))} for i, p in enumerate(pred, 1)]
    return [{"week": f"W{i}", "predicted_stock": max(0, 80 - i * 8 + random.randint(-5, 5))} for i in range(1, 5)]


def process_inventory_csv(file: UploadFile, db: Session) -> Dict[str, Any]:
    if not HAS_PANDAS:
        raise HTTPException(status_code=500, detail="Pandas is not installed")
        
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are allowed")

    try:
        content = file.file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")
        
    required_cols = {'item_name', 'category', 'quantity', 'price'}
    if not required_cols.issubset(set(df.columns)):
        missing = required_cols - set(df.columns)
        raise HTTPException(status_code=400, detail=f"Missing required columns: {missing}")

    # Handle nan values, missing info in dataframe, invalid types
    df = df.dropna(subset=['item_name', 'category'])
    df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0).astype(int)
    df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0.0).astype(float)
    
    if df.empty:
        raise HTTPException(status_code=400, detail="The file is empty or has no valid rows")

    errors = []
    records_added = 0
    
    for _, row in df.iterrows():
        item_name = str(row['item_name']).strip()
        category = str(row['category']).strip()
        quantity = int(row['quantity'])
        price = float(row['price'])
        
        if not item_name:
            continue
            
        existing = db.query(InventoryItem).filter(InventoryItem.item_name == item_name).first()
        if existing:
            # Update quantity and price
            existing.quantity = quantity
            existing.price = price
            existing.category = category
            records_added += 1 # consider it processed
        else:
            new_item = InventoryItem(
                item_name=item_name,
                category=category,
                quantity=quantity,
                price=price
            )
            db.add(new_item)
            records_added += 1

    db.commit()
    
    return {
        "success": True,
        "records_added": records_added,
        "errors": errors
    }
