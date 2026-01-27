# URGENT FIX: 400 Bad Request on Orders

## The Problem
Both "Buy Now" and "Checkout" are failing with 400 error after stock updates.

## The Cause
The `price` column was added as NOT NULL but the code might be sending null values, or RLS policies are blocking the insert.

## THE FIX (Run This Complete Script!)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Copy and Run This COMPLETE SQL

```sql
-- Make price column nullable
ALTER TABLE orders ALTER COLUMN price DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN price SET DEFAULT 0;

-- Ensure all columns exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false;

-- Recreate RLS policies
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Step 3: Click "Run" Button

### Step 4: Clear Browser Cache and Test
1. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac) to hard refresh
2. Try "Buy Now" - should work ✅
3. Try "Checkout" - should work ✅

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
