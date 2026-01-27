# Quick Fix for Buy Now Email Issue

## The Problem
The `orders` table is missing the `price` and `variant_image` columns that the BuyNowSheet component is trying to insert.

## Simple Solution

### Step 1: Run this SQL in Supabase Dashboard
Go to SQL Editor and run:

```sql
-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;
```

### Step 2: Set up Database Webhook (Alternative to Trigger)
1. Go to Supabase Dashboard → Database → Webhooks
2. Click "Create a new hook"
3. Configure:
   - **Name**: `send-order-notification`
   - **Table**: `orders`
   - **Events**: Check "Insert"
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://[YOUR-PROJECT-REF].supabase.co/functions/v1/send-order-notification`
   - **HTTP Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer [YOUR-SERVICE-ROLE-KEY]
     ```

### Step 3: Test
Place a test order and check your email!

## Why This Works
- The webhook automatically calls the email function when a new order is inserted
- No need for pg_net extension or complex triggers
- Simpler and more reliable
