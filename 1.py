import csv
import random
import uuid
from datetime import datetime, timedelta

filename = "fraud_test.csv"
num_rows = 1200  # change as needed

merchant_categories = [
    "grocery",
    "electronics",
    "restaurant",
    "fuel",
    "travel",
    "crypto",
    "gambling",
    "shopping"
]

start_date = datetime(2024, 1, 1)

with open(filename, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow([
        "transaction_id",
        "amount",
        "timestamp",
        "merchant_category",
        "account_age_days"
    ])

    for _ in range(num_rows):
        transaction_id = str(uuid.uuid4())

        # realistic amount spread
        amount = round(random.uniform(10, 8000), 2)

        # random timestamp within 1 year
        random_minutes = random.randint(0, 365 * 24 * 60)
        ts = start_date + timedelta(minutes=random_minutes)
        timestamp = ts.strftime("%Y-%m-%d %H:%M:%S")

        merchant_category = random.choice(merchant_categories)

        account_age_days = random.randint(1, 2000)

        writer.writerow([
            transaction_id,
            amount,
            timestamp,
            merchant_category,
            account_age_days
        ])

print(f"{filename} generated.")