# SOLUTION: Fix Buy Now Email Issue

## Quick Fix (Do This Now!)

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;
```

That's it! This will fix the 400 error and allow Buy Now to work with your Zapier setup.

## What Was Wrong?

The `orders` table was missing 3 columns that the code was trying to insert:
1. **price** - Product price (BuyNowSheet was trying to save this)
2. **variant_image** - Selected variant image (BuyNowSheet was trying to save this)
3. **batch_id** - Groups cart items together (Checkout was using this, but column didn't exist)

## How Your Setup Works

### Checkout (Cart) → Zapier Email
- Multiple products added to cart
- All get same `batch_id` when ordered
- Zapier groups them and sends one email

### Buy Now → Zapier Email  
- Single product ordered
- No `batch_id` (or null)
- Zapier sends email for single product

## After Running the SQL

1. ✅ Buy Now will work without 400 error
2. ✅ Orders will be created in database
3. ✅ Zapier will trigger and send emails
4. ✅ Product details will be included (fetched via `product_id`)

## Files Created
- `fix_orders_table.sql` - The SQL to run
- `ZAPIER_FIX.md` - Detailed explanation
- This file - Quick reference

## Need Help?
If emails still don't work after running the SQL, check:
1. Zapier task history - is it triggering?
2. Zapier filters - are they correct?
3. Supabase orders table - is the order being created?
