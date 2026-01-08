# URGENT: Fix Database Schema Error

## Error Message
```
Could not find the 'brand' column of 'products' in the schema cache
```

## Solution
You need to run the database migration. Go to your **Supabase Dashboard**:

1. Open your project at https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Paste this SQL:

```sql
-- Add brand and model columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT;

-- Add indexes for better filtering performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
```

5. Click **Run** (or press Ctrl+Enter)
6. Wait for "Success. No rows returned"
7. Refresh your application

## Verify It Worked
Run this query to verify:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('brand', 'model');
```

You should see both columns listed.

## After Migration
- Restart your dev server: `npm run dev`
- The error will be gone
- You can now add/edit products with brand and model fields
