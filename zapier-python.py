# ZAPIER PYTHON CODE - Use this instead of JavaScript

import json
from datetime import datetime

# Get data from webhook
batch_id = input_data.get('batch_id', '')
shop_name = input_data.get('shop_name', '')
shop_address = input_data.get('shop_address', '')
created_at = input_data.get('created_at', '')
products_raw = input_data.get('products', '[]')

# Parse products
if isinstance(products_raw, str):
    products = json.loads(products_raw)
elif isinstance(products_raw, list):
    products = products_raw
else:
    products = []

# Format date
dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
date = dt.strftime('%d/%m/%Y %H:%M')

# Build products text
text = ''
total = 0

for p in products:
    variants = p.get('variants', {})
    vars_text = ', '.join([f"{k}: {v}" for k, v in variants.items()]) if variants else ''
    
    subtotal = p['quantity'] * p['price']
    total += subtotal
    
    text += f"Product: {p['name']}\n"
    if vars_text:
        text += f"Variants: {vars_text}\n"
    text += f"Quantity: {p['quantity']} × ₹{p['price']:,} = ₹{subtotal:,}\n\n"

# Build message
message = f"""🛒 NEW ORDER

📅 Date: {date}
🔢 Batch ID: {batch_id}

📦 Products:
---
{text}Total: ₹{total:,}
---

🏪 Shop Details:
Name: {shop_name}
Address: {shop_address}"""

output = {'message': message}
