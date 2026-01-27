# Supabase SQL Views for Zapier Email Data

## Create Views in Supabase

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- View for order details with product info (for Zapier)
CREATE OR REPLACE VIEW order_email_data AS
SELECT 
    o.id as order_id,
    o.batch_id,
    o.quantity,
    o.price as unit_price,
    o.variants::text as variants,
    o.shop_name,
    o.shop_address,
    o.user_id,
    o.is_delivered,
    TO_CHAR(o.created_at, 'DD/MM/YYYY') as ordered_on,
    o.created_at,
    (o.price * o.quantity) as subtotal,
    p.name as product_name,
    p.brand,
    p.model,
    p.description,
    p.image as product_image,
    o.variant_image,
    -- Determine if single or batch order
    CASE 
        WHEN o.batch_id IS NULL THEN 'single'
        ELSE 'batch'
    END as order_type
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
ORDER BY o.created_at DESC;

-- Grant access to the view
GRANT SELECT ON order_email_data TO anon, authenticated;
```

---

## Zapier Setup (Webhook Method)

### Step 1: Configure Supabase Webhook

**Supabase Dashboard → Database → Webhooks → Create Hook**

- **Name**: `zapier-order-notification`
- **Table**: `orders`
- **Events**: ✓ Insert
- **Type**: HTTP Request
- **Method**: POST
- **URL**: Your Zapier webhook URL
- **HTTP Params**: `record`

### Step 2: Create Zapier Webhook

**Zapier → Create Zap → Webhooks by Zapier → Catch Hook**

Copy the webhook URL and paste it in Supabase webhook above.

### Step 3: Add SQL Query Action (Webhooks by Zapier - GET)

**For Single Product (Buy Now):**

- **URL**: 
```
https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/order_email_data?order_id=eq.{{record__id}}&select=*
```

- **Headers**:
  - `apikey`: YOUR_SUPABASE_ANON_KEY
  - `Authorization`: Bearer YOUR_SUPABASE_ANON_KEY

**For Multiple Products (Checkout):**

- **URL**:
```
https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/order_email_data?batch_id=eq.{{record__batch_id}}&select=*
```

- **Headers**: Same as above

---

## Zapier Data Variables

### Single Product Response (from view):
```
{{2__0__order_id}}          → Order ID
{{2__0__product_name}}      → Product Name
{{2__0__brand}}             → Brand
{{2__0__model}}             → Model
{{2__0__variants}}          → Variants
{{2__0__quantity}}          → Quantity
{{2__0__unit_price}}        → Unit Price
{{2__0__subtotal}}          → Subtotal
{{2__0__shop_name}}         → Shop Name
{{2__0__shop_address}}      → Shop Address
{{2__0__batch_id}}          → Batch ID (null for Buy Now)
{{2__0__ordered_on}}        → Ordered on (DD/MM/YYYY)
{{2__0__order_type}}        → "single" or "batch"
```

### Multiple Products Response (array):
Same fields but multiple items in array.

---

## Complete Zapier Workflow

### Zap 1: Single Product (Buy Now)

1. **Webhooks by Zapier** - Catch Hook
2. **Filter** - Only continue if `record order_type` equals `single` OR `record batch_id` Does not exist
3. **Webhooks by Zapier** - GET from view
4. **Gmail/Email** - Send email

**Email Template:**
```
Subject: New Order: {{2__0__brand}} {{2__0__model}}

A new order has been received.

PRODUCT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{2__0__order_id}}
Product Name: {{2__0__product_name}}
Brand: {{2__0__brand}}
Model: {{2__0__model}}
Variant: {{2__0__variants}}
Quantity: {{2__0__quantity}}
Unit Price: ₹{{2__0__unit_price}}
Subtotal: ₹{{2__0__subtotal}}

ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shop Name: {{2__0__shop_name}}
Shop Address: {{2__0__shop_address}}

Batch ID: {{2__0__order_id}}
Order ID: {{2__0__order_id}}
Ordered on: {{2__0__ordered_on}}
```

---

### Zap 2: Multiple Products (Checkout)

1. **Webhooks by Zapier** - Catch Hook
2. **Filter** - Only continue if `record batch_id` Exists
3. **Webhooks by Zapier** - GET all orders from view
4. **Code by Zapier** - Format products
5. **Gmail/Email** - Send email

**Code by Zapier (Python):**
```python
import json

# Get the response from the view query
# Zapier passes this as a string, so we need to parse it
raw_data = input_data.get('data', '[]')

# If it's already a list, use it; otherwise parse JSON
if isinstance(raw_data, str):
    orders = json.loads(raw_data)
else:
    orders = raw_data

# Build product details text
products_text = ""
total = 0

for i, order in enumerate(orders, 1):
    subtotal = float(order.get('subtotal', 0))
    total += subtotal
    
    products_text += f"""Order ID: {order.get('order_id', 'N/A')}
Product Name: {order.get('product_name', 'N/A')}
Brand: {order.get('brand', 'N/A')}
Model: {order.get('model', 'N/A')}
Variant: {order.get('variants', '{}')}
Quantity: {order.get('quantity', 0)}
Unit Price: ₹{float(order.get('unit_price', 0)):,.0f}
Subtotal: ₹{subtotal:,.0f}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""

# Get common details from first order
first_order = orders[0] if orders else {}

output = {
    'products_text': products_text,
    'total': f"{total:,.0f}",
    'product_count': len(orders),
    'shop_name': first_order.get('shop_name', 'N/A'),
    'shop_address': first_order.get('shop_address', 'N/A'),
    'batch_id': first_order.get('batch_id', 'N/A'),
    'ordered_on': first_order.get('ordered_on', 'N/A')
}
```

**Input Data:**
- `data`: `{{2__body}}` or `{{2__data}}` (the full response from GET request)

**Email Template:**
```
Subject: New Cart Order - {{4__product_count}} Products

A new order has been received.

PRODUCT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{4__products_text}}

TOTAL: ₹{{4__total}}

ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shop Name: {{4__shop_name}}
Shop Address: {{4__shop_address}}

Batch ID: {{4__batch_id}}
Ordered on: {{4__ordered_on}}
```

---

## Alternative: Simpler Approach Without Code

If you want to avoid Code by Zapier for multiple products, create a PostgreSQL function:

```sql
-- Function to format order email data
CREATE OR REPLACE FUNCTION get_order_email_text(p_batch_id uuid)
RETURNS TABLE (
    products_text text,
    total numeric,
    product_count integer,
    shop_name text,
    shop_address text,
    batch_id uuid,
    ordered_on text
) AS $$
DECLARE
    v_products_text text := '';
    v_total numeric := 0;
    v_count integer := 0;
    v_shop_name text;
    v_shop_address text;
    v_ordered_on text;
    r record;
BEGIN
    -- Loop through orders
    FOR r IN 
        SELECT * FROM order_email_data 
        WHERE order_email_data.batch_id = p_batch_id
        ORDER BY created_at
    LOOP
        v_count := v_count + 1;
        v_total := v_total + r.subtotal;
        
        v_products_text := v_products_text || format(
            E'Order ID: %s\nProduct Name: %s\nBrand: %s\nModel: %s\nVariant: %s\nQuantity: %s\nUnit Price: ₹%s\nSubtotal: ₹%s\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n',
            r.order_id,
            r.product_name,
            COALESCE(r.brand, 'N/A'),
            COALESCE(r.model, 'N/A'),
            r.variants,
            r.quantity,
            r.unit_price,
            r.subtotal
        );
        
        -- Get common details from first record
        IF v_count = 1 THEN
            v_shop_name := r.shop_name;
            v_shop_address := r.shop_address;
            v_ordered_on := r.ordered_on;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT 
        v_products_text,
        v_total,
        v_count,
        v_shop_name,
        v_shop_address,
        p_batch_id,
        v_ordered_on;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_order_email_text(uuid) TO anon, authenticated;
```

Then in Zapier, call this function:

**URL**:
```
https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/rpc/get_order_email_text
```

**Method**: POST

**Body**:
```json
{
  "p_batch_id": "{{record__batch_id}}"
}
```

**Headers**: Same as before

This returns formatted text ready to use in email!

---

## Summary

### What We Created:
1. **SQL View** (`order_email_data`) - Joins orders + products with formatted date
2. **Optional Function** - Formats multiple products into email text

### Zapier Uses:
- **Webhook** to receive order notification
- **GET request** to fetch from view (all data pre-formatted)
- **Email** to send (data is ready to use)

### Benefits:
✅ All formatting done in SQL
✅ Date already in DD/MM/YYYY format
✅ Subtotal pre-calculated
✅ Product details joined
✅ No complex Zapier logic needed
✅ Just fetch and send!

---

## Testing

1. **Test the view**:
```sql
SELECT * FROM order_email_data ORDER BY created_at DESC LIMIT 5;
```

2. **Test single order**:
```sql
SELECT * FROM order_email_data WHERE order_id = 'YOUR_ORDER_ID';
```

3. **Test batch orders**:
```sql
SELECT * FROM order_email_data WHERE batch_id = 'YOUR_BATCH_ID';
```

4. **Test function** (if using):
```sql
SELECT * FROM get_order_email_text('YOUR_BATCH_ID');
```
