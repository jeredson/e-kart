# Zapier Setup Guide for Buy Now & Checkout Orders (Webhook Method)

## Overview
Your Zapier receives order data via Supabase Database Webhooks:
1. **Buy Now** - Single product (batch_id is null)
2. **Checkout** - Multiple products (same batch_id)

## Zapier Workflow Setup

### Zap 1: Buy Now Orders (Single Product)

#### Trigger
- **App**: Webhooks by Zapier
- **Event**: Catch Hook
- **Webhook URL**: Copy this URL and use it in Supabase webhook

**Filter**: Only continue if `batch_id` is empty/null
- Filter: `batch_id` (Text) Does not exist

#### Action 1: Get Product Details via HTTP Request
- **App**: Webhooks by Zapier
- **Action**: GET Request
- **URL**: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/products?id=eq.{{record__product_id}}&select=*`
- **Headers**:
  - `apikey`: Your Supabase anon key
  - `Authorization`: `Bearer YOUR_SUPABASE_ANON_KEY`

This returns product details as JSON array. Access first item:
- `{{1__name}}` - Product name
- `{{1__brand}}` - Brand
- `{{1__model}}` - Model
- `{{1__description}}` - Description

#### Action 2: Format Variants (Optional)
- **App**: Formatter by Zapier
- **Action**: Text → Extract Pattern
- **Input**: `{{record__variants}}`
- Parse the JSON to extract Color, Ram, Storage

#### Action 3: Send Email
- **App**: Gmail / Email by Zapier
- **To**: Your admin email
- **Subject**: `New Buy Now Order: {{1__brand}} {{1__model}}`
- **Body**:
```
A new order has been received.

PRODUCT DETAILS
Product Name: {{1__name}}
Brand: {{1__brand}}
Model: {{1__model}}
Description: {{1__description}}
Selected Variation: {{record__variants}}
Quantity: {{record__quantity}}
Price per unit: ₹{{record__price}}
Subtotal: ₹{{record__price}} × {{record__quantity}}

SHOP DETAILS
Shop Name: {{record__shop_name}}
Shop Address: {{record__shop_address}}

Batch ID: {{record__id}}
Order Date: {{record__created_at}}
```

---

### Zap 2: Checkout Orders (Multiple Products)

#### Trigger
- **App**: Webhooks by Zapier
- **Event**: Catch Hook
- **Webhook URL**: Use same URL or create separate webhook

**Filter**: Only continue if `batch_id` is NOT empty
- Filter: `batch_id` (Text) Exists

#### Action 1: Get All Orders in Batch via HTTP Request
- **App**: Webhooks by Zapier
- **Action**: GET Request
- **URL**: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/orders?batch_id=eq.{{record__batch_id}}&select=*`
- **Headers**:
  - `apikey`: Your Supabase anon key
  - `Authorization`: `Bearer YOUR_SUPABASE_ANON_KEY`

This returns all orders with the same batch_id.

#### Action 2: Loop Through Orders
- **App**: Looping by Zapier
- **Items**: Split the response array

#### Action 3: Get Product Details for Each (Inside Loop)
- **App**: Webhooks by Zapier
- **Action**: GET Request
- **URL**: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/products?id=eq.{{loop__product_id}}&select=*`
- **Headers**: Same as above

#### Action 4: Aggregate with Digest
- **App**: Digest by Zapier
- Collect all product details

#### Action 5: Send Single Email
- **App**: Gmail / Email by Zapier
- Include all products from digest

---

## Email Template Examples

### For Buy Now (Single Product)

```
Subject: New Order: {{product.brand}} {{product.model}}

A new order has been received.

PRODUCT DETAILS
Product Name: {{product.name}}
Brand: {{product.brand}}
Model: {{product.model}}
Description: {{product.description}}
Selected Variation: {{variants}}
Quantity: {{quantity}}
Price per unit: ₹{{price}}
Subtotal: ₹{{price * quantity}}

SHOP DETAILS
Shop Name: {{shop_name}}
Shop Address: {{shop_address}}

Batch ID: {{order_id}}
Order Date: {{created_at}}
```

### For Checkout (Multiple Products)

```
Subject: New Cart Order - {{batch_id}}

A new cart order has been received.

PRODUCTS:
{{#each products}}
- {{name}} ({{brand}} {{model}})
  Variants: {{variants}}
  Quantity: {{quantity}}
  Price: ₹{{price}}
  Subtotal: ₹{{subtotal}}
{{/each}}

TOTAL: ₹{{total}}

SHOP DETAILS
Shop Name: {{shop_name}}
Shop Address: {{shop_address}}

Batch ID: {{batch_id}}
Order Date: {{created_at}}
```

---

## Zapier Filter Conditions

### Buy Now Filter
```
Filter 1: batch_id (Text) Does not exist
OR
Filter 1: batch_id (Text) Is empty
```

### Checkout Filter
```
Filter 1: batch_id (Text) Exists
AND
Filter 1: batch_id (Text) Is not empty
```

---

## Testing

### Test Buy Now:
1. Place a single product order using "Buy Now"
2. Check Zapier task history
3. Verify:
   - Trigger fired
   - Product details fetched
   - Email sent with correct product info

### Test Checkout:
1. Add multiple products to cart
2. Complete checkout
3. Check Zapier task history
4. Verify:
   - Trigger fired for each product
   - All products grouped by batch_id
   - Single email sent with all products

---

## Troubleshooting

### Product details are empty
- Check that `product_id` in orders matches `id` in products table
- Verify the "Find Record" action is using the correct field mapping

### Variants not showing
- The `variants` field is JSONB
- In Zapier, you may need to parse it: `{{trigger.variants__Color}}`, `{{trigger.variants__Ram}}`, etc.
- Or use Formatter to convert JSON to text

### Multiple emails for cart checkout
- Make sure you're using "Find Records" (plural) not "Find Record"
- Use Digest or Storage to aggregate before sending email

### Buy Now orders not triggering
- Check the filter condition
- Verify `batch_id` is actually null in the database
- Check Zapier task history for filtered tasks

---

## Database Query for Verification

Run this in Supabase to see your orders:

```sql
-- See all orders with their product info
SELECT 
    o.id,
    o.batch_id,
    o.quantity,
    o.price,
    o.variants,
    o.shop_name,
    o.created_at,
    p.name as product_name,
    p.brand,
    p.model
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;
```

This helps you verify the data structure Zapier will receive.
