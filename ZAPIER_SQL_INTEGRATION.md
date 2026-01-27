# Zapier Setup Using Supabase PostgreSQL Integration

## Prerequisites
- Zapier account (Premium for PostgreSQL integration)
- Supabase project connection details

## Supabase Connection Details

Get these from Supabase Dashboard → Settings → Database:

- **Host**: `db.aqcmmfeimioxvcpwpafr.supabase.co`
- **Database**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: Your database password
- **SSL**: Required

---

## Setup 1: Single Product (Buy Now)

### Step 1: Trigger - PostgreSQL New Row
- **App**: PostgreSQL
- **Event**: New Row
- **Table**: `orders`
- **Connection**: Use Supabase connection details above

### Step 2: Filter
- **Only continue if**: `Batch Id` Does not exist

### Step 3: PostgreSQL - Run Query
- **App**: PostgreSQL
- **Action**: Run Query
- **Query**:
```sql
SELECT 
    p.name,
    p.brand,
    p.model,
    p.description
FROM products p
WHERE p.id = '{{1__Product Id}}'::uuid
LIMIT 1;
```

### Step 4: Format Date
- **App**: Formatter by Zapier
- **Transform**: Date/Time → Format
- **Input**: `{{1__Created At}}`
- **To Format**: `DD/MM/YYYY`

### Step 5: Calculate Subtotal
- **App**: Formatter by Zapier
- **Transform**: Numbers → Spreadsheet-Style Formula
- **Formula**: `{{1__Price}} * {{1__Quantity}}`

### Step 6: Send Email
- **App**: Gmail / Email by Zapier
- **Subject**: `New Order: {{3__Brand}} {{3__Model}}`
- **Body**: See template below

---

## Setup 2: Multiple Products (Checkout)

### Step 1: Trigger - PostgreSQL New Row
- **App**: PostgreSQL
- **Event**: New Row
- **Table**: `orders`

### Step 2: Filter
- **Only continue if**: `Batch Id` Exists

### Step 3: PostgreSQL - Run Query (Get All Orders + Products)
- **App**: PostgreSQL
- **Action**: Run Query
- **Query**:
```sql
SELECT 
    o.id as order_id,
    o.quantity,
    o.price as unit_price,
    o.variants,
    o.shop_name,
    o.shop_address,
    o.batch_id,
    o.created_at,
    p.name as product_name,
    p.brand,
    p.model,
    (o.price * o.quantity) as subtotal
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
WHERE o.batch_id = '{{1__Batch Id}}'::uuid
ORDER BY o.created_at;
```

This returns ALL orders in the batch with product details in one query!

### Step 4: Format Date
- **App**: Formatter by Zapier
- **Transform**: Date/Time → Format
- **Input**: `{{1__Created At}}`
- **To Format**: `DD/MM/YYYY`

### Step 5: Code by Zapier (Format Multiple Products)
- **App**: Code by Zapier
- **Language**: Python
- **Code**:
```python
# Input from Step 3 query results
orders = input_data.get('query_results', [])

# Build product list
products_text = ""
total = 0

for i, order in enumerate(orders, 1):
    subtotal = float(order.get('subtotal', 0))
    total += subtotal
    
    products_text += f"""
Order ID: {order.get('order_id', 'N/A')}
Product Name: {order.get('product_name', 'N/A')}
Brand: {order.get('brand', 'N/A')}
Model: {order.get('model', 'N/A')}
Variant: {order.get('variants', '{}')}
Quantity: {order.get('quantity', 0)}
Unit Price: ₹{float(order.get('unit_price', 0)):,.2f}
Subtotal: ₹{subtotal:,.2f}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""

output = {
    'products_text': products_text,
    'total': f'₹{total:,.2f}',
    'product_count': len(orders),
    'shop_name': orders[0].get('shop_name', 'N/A') if orders else 'N/A',
    'shop_address': orders[0].get('shop_address', 'N/A') if orders else 'N/A',
    'batch_id': orders[0].get('batch_id', 'N/A') if orders else 'N/A'
}
```

### Step 6: Send Email
- **App**: Gmail / Email by Zapier
- Use aggregated data from Code step

---

## Email Templates

### Single Product (Buy Now)

**Subject:**
```
New Order: {{3__Brand}} {{3__Model}}
```

**Body:**
```
A new order has been received.

PRODUCT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{1__Id}}
Product Name: {{3__Name}}
Brand: {{3__Brand}}
Model: {{3__Model}}
Variant: {{1__Variants}}
Quantity: {{1__Quantity}}
Unit Price: ₹{{1__Price}}
Subtotal: ₹{{5__output}}

ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shop Name: {{1__Shop Name}}
Shop Address: {{1__Shop Address}}

Batch ID: {{1__Id}}
Order ID: {{1__Id}}
Ordered on: {{4__output}}
```

### Multiple Products (Checkout)

**Subject:**
```
New Cart Order - {{product_count}} Products
```

**Body:**
```
A new order has been received.

PRODUCT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{5__products_text}}

TOTAL: {{5__total}}

ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shop Name: {{5__shop_name}}
Shop Address: {{5__shop_address}}

Batch ID: {{5__batch_id}}
Ordered on: {{4__output}}
```

---

## Zapier Variable Names (PostgreSQL Trigger)

### From New Row Trigger (Step 1):
```
{{1__Id}}                   → Order ID
{{1__User Id}}              → User ID
{{1__Product Id}}           → Product ID (UUID)
{{1__Quantity}}             → Quantity
{{1__Price}}                → Unit Price
{{1__Variants}}             → Variants (JSONB)
{{1__Variant Image}}        → Variant Image URL
{{1__Shop Name}}            → Shop Name
{{1__Shop Address}}         → Shop Address
{{1__Batch Id}}             → Batch ID (null for Buy Now)
{{1__Is Delivered}}         → Delivery status
{{1__Created At}}           → Created timestamp
{{1__Updated At}}           → Updated timestamp
```

### From Product Query (Step 3):
```
{{3__Name}}                 → Product Name
{{3__Brand}}                → Brand
{{3__Model}}                → Model
{{3__Description}}          → Description
```

### From Date Formatter (Step 4):
```
{{4__output}}               → Formatted date (DD/MM/YYYY)
```

### From Subtotal Calculator (Step 5):
```
{{5__output}}               → Subtotal (price × quantity)
```

---

## Alternative: Single SQL Query for Everything (Buy Now)

If you want to get everything in one query:

### Step 3: PostgreSQL - Run Query
```sql
SELECT 
    o.id as order_id,
    o.quantity,
    o.price as unit_price,
    o.variants,
    o.shop_name,
    o.shop_address,
    o.batch_id,
    TO_CHAR(o.created_at, 'DD/MM/YYYY') as formatted_date,
    (o.price * o.quantity) as subtotal,
    p.name as product_name,
    p.brand,
    p.model,
    p.description
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
WHERE o.id = '{{1__Id}}'::uuid
LIMIT 1;
```

Then in email, use:
```
Order ID: {{3__Order Id}}
Product Name: {{3__Product Name}}
Brand: {{3__Brand}}
Model: {{3__Model}}
Variant: {{3__Variants}}
Quantity: {{3__Quantity}}
Unit Price: ₹{{3__Unit Price}}
Subtotal: ₹{{3__Subtotal}}

Shop Name: {{3__Shop Name}}
Shop Address: {{3__Shop Address}}

Batch ID: {{3__Order Id}}
Order ID: {{3__Order Id}}
Ordered on: {{3__Formatted Date}}
```

This eliminates the need for Formatter steps!

---

## Complete SQL Query for Checkout (All-in-One)

```sql
SELECT 
    o.id as order_id,
    o.quantity,
    o.price as unit_price,
    o.variants::text as variants,
    o.shop_name,
    o.shop_address,
    o.batch_id,
    TO_CHAR(o.created_at, 'DD/MM/YYYY') as formatted_date,
    (o.price * o.quantity) as subtotal,
    p.name as product_name,
    p.brand,
    p.model,
    p.description,
    (SELECT SUM(price * quantity) FROM orders WHERE batch_id = o.batch_id) as total
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
WHERE o.batch_id = '{{1__Batch Id}}'::uuid
ORDER BY o.created_at;
```

This returns:
- All orders in batch
- Product details for each
- Individual subtotals
- Grand total
- Formatted date

---

## Setup Summary

### Buy Now (Simplest Method):
1. **PostgreSQL** - New Row in orders
2. **Filter** - batch_id Does not exist
3. **PostgreSQL** - Run query (get order + product in one query)
4. **Email** - Send with data from query

### Checkout (Simplest Method):
1. **PostgreSQL** - New Row in orders
2. **Filter** - batch_id Exists
3. **PostgreSQL** - Run query (get all orders + products in batch)
4. **Code by Zapier** - Format multiple products into text
5. **Email** - Send with formatted data

---

## Testing

1. **Test Buy Now**:
   - Place order with Buy Now
   - Check Zapier task history
   - Verify SQL query returns product details
   - Check email has all fields

2. **Test Checkout**:
   - Add 2+ products to cart
   - Complete checkout
   - Check Zapier task history
   - Verify SQL query returns all products
   - Check email shows all products with total

---

## Troubleshooting

### Connection Issues
- Verify database password is correct
- Ensure SSL is enabled
- Check IP whitelist in Supabase (if applicable)

### Query Errors
- Test queries in Supabase SQL Editor first
- Ensure UUID casting with `::uuid`
- Check column names match exactly (case-sensitive)

### Missing Data
- Verify foreign key relationships
- Check that product_id exists in products table
- Ensure batch_id is properly set for checkout orders
