# URGENT FIX: 400 Bad Request on Orders

## The Problem
Both "Buy Now" and "Checkout" are failing with 400 error.

## The Cause
The `orders` table is missing required columns.

## THE FIX (Do This Now!)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Copy and Run This SQL

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false;
```

### Step 3: Click "Run" Button

### Step 4: Test
- Try "Buy Now" - should work ✅
- Try "Checkout" - should work ✅

## What This Does
Adds 4 missing columns to your orders table:
- `price` - Stores the product price
- `variant_image` - Stores the selected variant image
- `batch_id` - Groups cart items together
- `is_delivered` - Tracks delivery status

## After This Fix
- Orders will be created successfully
- Zapier will receive the order data
- Emails will be sent automatically

## Still Getting Errors?
If you still see 400 errors after running the SQL:
1. Check the browser console for the exact error message
2. Verify the SQL ran successfully (no red error messages)
3. Try refreshing your app page (Ctrl+F5 or Cmd+Shift+R)
