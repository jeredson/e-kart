# Batch Email for Cart Checkout - Implementation Guide

## Overview
This update ensures that when a user checks out multiple items from their cart, all products are sent in a **single email** instead of separate emails for each product.

## Changes Made

### 1. Database Changes
Run the SQL script: `update_orders_batch_email.sql`

This script:
- Adds a `batch_id` column to the `orders` table
- Updates the webhook function to detect batch orders
- Sends a single email for all items in a cart checkout
- Keeps individual emails for "Buy Now" orders

### 2. Frontend Changes
Updated `Checkout.tsx` to assign the same `batch_id` to all orders from a single cart checkout.

## How It Works

### Cart Checkout (Multiple Items)
1. User adds multiple products to cart
2. User proceeds to checkout
3. All orders are created with the **same batch_id**
4. Webhook function detects the batch_id
5. **Single email** is sent with all products listed

### Buy Now (Single Item)
1. User clicks "Buy Now" on a product
2. Order is created **without batch_id**
3. Webhook function detects no batch_id
4. Individual email is sent (as before)

## Email Format

### Batch Order Email (Cart Checkout)
```
Subject: New Batch Order - [Shop Name]

Order Type: Cart Checkout
Batch ID: [UUID]
Shop: [Shop Name]
Address: [Shop Address]

Products:
1. [Product Name]
   - Brand: [Brand]
   - Model: [Model]
   - Variants: [Color, RAM, Storage]
   - Quantity: [Qty]
   - Price: ₹[Price]
   - Subtotal: ₹[Subtotal]

2. [Product Name]
   ...

Total Amount: ₹[Total]
Order Date: [Date & Time]
```

### Single Order Email (Buy Now)
```
Subject: New Order - [Brand] [Model]

Order Type: Single Order
Order ID: [UUID]
Product: [Product Name]
Brand: [Brand]
Model: [Model]
Variants: [Color, RAM, Storage]
Quantity: [Qty]
Price: ₹[Price]
Subtotal: ₹[Subtotal]

Shop: [Shop Name]
Address: [Shop Address]
Order Date: [Date & Time]
```

## Setup Instructions

### Step 1: Run Database Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open `update_orders_batch_email.sql`
4. Replace `YOUR_WEBHOOK_URL_HERE` with your actual webhook URL
5. Run the script

### Step 2: Update Zapier Webhook Handler
If you're using Zapier, update your email template to handle both formats:

**For Gmail/Email Action:**
- Check if `order_type` is "batch" or "single"
- Use conditional formatting in Zapier to display different templates

**Example Zapier Setup:**
1. Add a "Filter" step after webhook trigger
2. Create two paths: one for batch, one for single
3. Format emails differently for each path

### Step 3: Test the Implementation

**Test Cart Checkout:**
1. Add 2-3 products to cart
2. Proceed to checkout
3. Place order
4. Verify you receive **ONE email** with all products

**Test Buy Now:**
1. Click "Buy Now" on any product
2. Complete the order
3. Verify you receive **ONE email** for that single product

## Admin Order Management

The admin order management page now shows:
- Orders grouped by date and user
- Subtotal for all orders in a group
- All product details when clicking a date card

## Troubleshooting

**Still receiving multiple emails for cart checkout?**
- Verify the `batch_id` column was added: `SELECT * FROM orders LIMIT 1;`
- Check if the webhook function was updated
- Ensure the frontend code is deployed

**Emails not arriving?**
- Check Zapier task history
- Verify webhook URL is correct in the SQL function
- Test webhook manually using Zapier's test feature

**Batch orders not grouping?**
- Check if all orders have the same `batch_id`
- Query: `SELECT batch_id, COUNT(*) FROM orders GROUP BY batch_id;`

## Database Query Examples

**View all batch orders:**
```sql
SELECT batch_id, COUNT(*) as order_count, SUM(quantity * price) as total
FROM orders
WHERE batch_id IS NOT NULL
GROUP BY batch_id
ORDER BY created_at DESC;
```

**View orders in a specific batch:**
```sql
SELECT o.*, p.name as product_name
FROM orders o
JOIN products p ON p.id = o.product_id
WHERE o.batch_id = 'YOUR_BATCH_ID_HERE';
```

## Notes
- The `pg_sleep(0.5)` in the webhook function ensures all batch inserts complete before sending the email
- Buy Now orders (without batch_id) continue to work as before
- The batch_id is a UUID generated on the frontend for each checkout session
