# Database Update Instructions

## Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar

## Step 2: Run the SQL Script
Copy and paste this SQL into the SQL Editor and click "Run":

```sql
-- Add pricing fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discounted_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS variant_pricing JSONB,
ADD COLUMN IF NOT EXISTS variant_exceptions JSONB;

-- Update existing products to use price as discounted_price
UPDATE public.products 
SET discounted_price = price, original_price = price
WHERE discounted_price IS NULL;
```

## Step 3: Verify the Update
Run this query to check if columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('original_price', 'discounted_price', 'variant_pricing', 'variant_exceptions');
```

You should see 4 rows returned.

## Step 4: Restart Your Application
After running the SQL:
1. Stop your dev server (Ctrl+C)
2. Run `npm run dev` again
3. The discount feature should now work

## What This Does:
- Adds `original_price` column for the original product price
- Adds `discounted_price` column for the sale price
- Adds `variant_pricing` column for variant-specific pricing
- Adds `variant_exceptions` column for unavailable variants
- Updates existing products to have both prices set to current price

## Troubleshooting:
If you get "column already exists" error, that's fine - it means the columns are already there. Just run the UPDATE statement separately:

```sql
UPDATE public.products 
SET discounted_price = price, original_price = price
WHERE discounted_price IS NULL;
```
