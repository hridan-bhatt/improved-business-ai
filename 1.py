import csv
import random

filename = "inventory_test.csv"
num_rows = 500  # change if needed

data = {
    "Electronics": [
        "USB Cable", "Power Bank", "Router", "Keyboard", "Mouse", "Smart Plug"
    ],
    "Electrical": [
        "LED Bulb", "Tube Light", "Switch Board", "Extension Cord", "Ceiling Fan"
    ],
    "Accessories": [
        "Laptop Stand", "HDMI Cable", "Surge Protector", "Battery Pack"
    ]
}

with open(filename, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["category", "item_name", "quantity", "price"])

    for _ in range(num_rows):
        category = random.choice(list(data.keys()))
        item_name = random.choice(data[category])

        quantity = random.randint(0, 300)

        # realistic price bands
        if category == "Electronics":
            price = round(random.uniform(300, 5000), 2)
        elif category == "Electrical":
            price = round(random.uniform(50, 3000), 2)
        else:
            price = round(random.uniform(200, 4000), 2)

        writer.writerow([category, item_name, quantity, price])

print(f"{filename} generated.")