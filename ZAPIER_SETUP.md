# ZAPIER SETUP GUIDE

## Step 1: Create Zap
1. Trigger: **Webhooks by Zapier** → **Catch Hook**
2. Copy webhook URL and paste in `FINAL_WEBHOOK.sql`
3. Test trigger by placing an order

## Step 2: Input Data Format
Zapier will receive this JSON:

```json
{
  "batch_id": "abc-123-def-456",
  "shop_name": "Chennai Mobiles",
  "shop_address": "Chennai",
  "created_at": "2026-01-28T10:30:00Z",
  "products": [
    {
      "name": "OnePlus 15R 5G",
      "variants": {"Color": "Charcoal Black"},
      "quantity": 2,
      "price": 47999
    },
    {
      "name": "Oppo A59 5G",
      "variants": {"Ram": "12GB"},
      "quantity": 1,
      "price": 13994
    }
  ]
}
```

## Step 3: Add Python Action
Action: **Code by Zapier** → **Run Python**

### Input Data Mapping:
**LEAVE INPUT DATA EMPTY** - Python will access webhook data directly

### Python Code:
```python
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
```

## Step 4: Send Message
Action: **Gmail/Telegram/Slack** → **Send Message**

Use: `{{output.message}}` from Step 2

## Output Example:
```
🛒 NEW ORDER

📅 Date: 28/01/2026 10:30
🔢 Batch ID: abc-123-def-456

📦 Products:
---
Product: OnePlus 15R 5G
Variants: Color: Charcoal Black
Quantity: 2 × ₹47,999 = ₹95,998

Product: Oppo A59 5G
Variants: Ram: 12GB
Quantity: 1 × ₹13,994 = ₹13,994

Total: ₹1,09,992
---

🏪 Shop Details:
Name: Chennai Mobiles
Address: Chennai
```
