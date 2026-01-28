    w# Complete Zapier Data Mapping for Orders

## Single Product (Buy Now) - Complete Field Mapping

### Step 1: Webhook Trigger
Receives order data from Supabase

### Step 2: Filter
- Only continue if `batch_id` Does not exist

### Step 3: Get Product Details (GET Request)
**URL**: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/products?id=eq.{{record__product_id}}&select=*`

### Step 4: Format Date (Formatter by Zapier)
- **Transform**: Date/Time → Format
- **Input**: `{{record__created_at}}`
- **From Format**: Auto-detect or `YYYY-MM-DDTHH:mm:ss.SSSZ`
- **To Format**: Custom → `DD/MM/YYYY`
- **Output**: `{{formatted_date}}`

### Step 5: Calculate Subtotal (Formatter by Zapier)
- **Transform**: Numbers → Perform Math Operation
- **Input**: `{{record__price}} * {{record__quantity}}`
- **Output**: `{{subtotal}}`

### Step 6: Format Variants (Formatter by Zapier)
- **Transform**: Text → Replace
- **Input**: `{{record__variants}}`
- **Find**: `{|}|"|:`
- **Replace with**: ` `
- **Output**: Cleaned variant text

### Step 7: Send Email

**Subject:**
```
New Order: {{3__0__brand}} {{3__0__model}}
```

**Body:**
```
A new order has been received.

PRODUCT DETAILS
Order ID: {{record__id}}
Product Name: {{3__0__name}}
Variant: {{record__variants}}
Quantity: {{record__quantity}}
Unit Price: ₹{{record__price}}
Subtotal: ₹{{5__output}}

ORDER DETAILS
Shop Name: {{record__shop_name}}
Shop Address: {{record__shop_address}}

Batch ID: {{record__id}}
Order ID: {{record__id}}
Ordered on: {{4__output}}
```

---

## Multiple Products (Checkout) - Complete Field Mapping

### Step 1: Webhook Trigger
Receives first order in batch

### Step 2: Filter
- Only continue if `batch_id` Exists

### Step 3: Get All Orders in Batch (GET Request)
**URL**: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/orders?batch_id=eq.{{record__batch_id}}&select=*`

### Step 4: Format Date
- **Input**: `{{record__created_at}}`
- **Output Format**: `DD/MM/YYYY`

### Step 5: Loop Through Orders (Looping by Zapier)
**Note**: This requires a premium Zapier plan. Alternative: Use Code by Zapier to process all at once.

#### Inside Loop:

**Step 5a: Get Product Details**
- **URL**: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/products?id=eq.{{3__product_id}}&select=*`

**Step 5b: Calculate Subtotal**
- **Input**: `{{3__price}} * {{3__quantity}}`

**Step 5c: Store in Digest**
- Append each product's details

### Step 6: Send Email After Loop

**Subject:**
```
New Cart Order - Batch {{record__batch_id}}
```

**Body:**
```
A new order has been received.

PRODUCT DETAILS
{{#each digest_items}}
Order ID: {{order_id}}
Product Name: {{product_name}}
Variant: {{variants}}
Quantity: {{quantity}}
Unit Price: ₹{{unit_price}}
Subtotal: ₹{{subtotal}}
---
{{/each}}

ORDER DETAILS
Shop Name: {{shop_name}}
Shop Address: {{shop_address}}

Batch ID: {{batch_id}}
Ordered on: {{formatted_date}}
```

---

## Exact Zapier Variable Names

### From Webhook (Step 1):
```
{{record__id}}              → Order ID
{{record__product_id}}      → Product ID (UUID)
{{record__quantity}}        → Quantity
{{record__price}}           → Unit Price
{{record__variants}}        → Variants (JSON)
{{record__variant_image}}   → Variant Image URL
{{record__shop_name}}       → Shop Name
{{record__shop_address}}    → Shop Address
{{record__batch_id}}        → Batch ID (null for Buy Now)
{{record__created_at}}      → Created timestamp
{{record__user_id}}         → User ID
{{record__is_delivered}}    → Delivery status
```

### From Product GET Request (Step 3):
```
{{3__0__id}}                → Product ID
{{3__0__name}}              → Product Name
{{3__0__brand}}             → Brand
{{3__0__model}}             → Model
{{3__0__description}}       → Description
{{3__0__price}}             → Base Price
{{3__0__image}}             → Product Image
```

### From Date Formatter (Step 4):
```
{{4__output}}               → Formatted date (DD/MM/YYYY)
```

### From Math Operation (Step 5):
```
{{5__output}}               → Subtotal (price × quantity)
```

---

## Copy-Paste Email Templates

### Single Product Email Template

```
Subject: New Order: {{3__0__brand}} {{3__0__model}}

A new order has been received.

PRODUCT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{record__id}}
Product Name: {{3__0__name}}
Variant: {{record__variants}}
Quantity: {{record__quantity}}
Unit Price: ₹{{record__price}}
Subtotal: ₹{{5__output}}

ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shop Name: {{record__shop_name}}
Shop Address: {{record__shop_address}}

Batch ID: {{record__id}}
Order ID: {{record__id}}
Ordered on: {{4__output}}
```

### Multiple Products Email Template (Simplified - No Loop)

If you want to avoid loops, use this approach:

**Step 3: Code by Zapier (Python)**

```python
import requests

# Get all orders in batch
batch_id = input_data['batch_id']
supabase_url = 'https://aqcmmfeimioxvcpwpafr.supabase.co'
anon_key = 'YOUR_ANON_KEY'

headers = {
    'apikey': anon_key,
    'Authorization': f'Bearer {anon_key}'
}

# Fetch all orders
orders_response = requests.get(
    f'{supabase_url}/rest/v1/orders?batch_id=eq.{batch_id}&select=*',
    headers=headers
)
orders = orders_response.json()

# Fetch product details for each order
product_details = []
total = 0

for order in orders:
    product_response = requests.get(
        f'{supabase_url}/rest/v1/products?id=eq.{order["product_id"]}&select=*',
        headers=headers
    )
    product = product_response.json()[0]
    
    subtotal = order['price'] * order['quantity']
    total += subtotal
    
    product_details.append({
        'order_id': order['id'],
        'product_name': product['name'],
        'brand': product.get('brand', ''),
        'model': product.get('model', ''),
        'variants': str(order.get('variants', {})),
        'quantity': order['quantity'],
        'unit_price': order['price'],
        'subtotal': subtotal
    })

# Format date
from datetime import datetime
created_at = datetime.fromisoformat(orders[0]['created_at'].replace('Z', '+00:00'))
formatted_date = created_at.strftime('%d/%m/%Y')

# Build product list text
products_text = ""
for i, p in enumerate(product_details, 1):
    products_text += f"""
Product {i}:
Order ID: {p['order_id']}
Product Name: {p['product_name']}
Brand: {p['brand']}
Model: {p['model']}
Variant: {p['variants']}
Quantity: {p['quantity']}
Unit Price: ₹{p['unit_price']:,}
Subtotal: ₹{p['subtotal']:,}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

output = {
    'products_text': products_text,
    'total': total,
    'shop_name': orders[0]['shop_name'],
    'shop_address': orders[0]['shop_address'],
    'batch_id': batch_id,
    'formatted_date': formatted_date,
    'product_count': len(product_details)
}
```

**Input Data:**
- `batch_id`: `{{record__batch_id}}`

**Email Body:**
```
Subject: New Cart Order - {{product_count}} Products

A new order has been received.

PRODUCT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{products_text}}

TOTAL: ₹{{total}}

ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shop Name: {{shop_name}}
Shop Address: {{shop_address}}

Batch ID: {{batch_id}}
Ordered on: {{formatted_date}}
```

---

## Step-by-Step Setup Summary

### For Single Product (Buy Now):

1. **Webhooks by Zapier** - Catch Hook
2. **Filter** - batch_id Does not exist
3. **Webhooks by Zapier** - GET product details
4. **Formatter** - Format date to DD/MM/YYYY
5. **Formatter** - Calculate subtotal (price × quantity)
6. **Gmail/Email** - Send email with template above

### For Multiple Products (Checkout):

**Option A: With Code (Recommended)**
1. **Webhooks by Zapier** - Catch Hook
2. **Filter** - batch_id Exists
3. **Code by Zapier** - Python script above
4. **Gmail/Email** - Send email with aggregated data

**Option B: With Loop (Requires Premium)**
1. **Webhooks by Zapier** - Catch Hook
2. **Filter** - batch_id Exists
3. **Webhooks by Zapier** - GET all orders in batch
4. **Looping by Zapier** - Loop through orders
5. **Webhooks by Zapier** - GET product for each (inside loop)
6. **Digest by Zapier** - Collect all products
7. **Gmail/Email** - Send email after digest

---

## Testing Checklist

- [ ] Buy Now order triggers webhook
- [ ] Filter correctly identifies Buy Now (no batch_id)
- [ ] Product details are fetched
- [ ] Date shows as DD/MM/YYYY
- [ ] Subtotal calculates correctly
- [ ] Email contains all required fields
- [ ] Checkout order triggers webhook
- [ ] Filter correctly identifies Checkout (has batch_id)
- [ ] All products in batch are included
- [ ] Total is calculated correctly
- [ ] Email shows all products
