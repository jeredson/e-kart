# Database Migration Guide

## Apply the Brand & Model Migration

You need to apply the database migration to add the `brand` and `model` columns to your products table.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the following:

```sql
-- Add brand and model columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT;

-- Add indexes for better filtering performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
```

4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
npx supabase db push
```

### Option 3: Manual SQL Execution

Connect to your database and run:

```sql
ALTER TABLE public.products 
ADD COLUMN brand TEXT,
ADD COLUMN model TEXT;

CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_price ON public.products(price);
```

## Verify Migration

After applying the migration, verify it worked:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('brand', 'model');
```

You should see both `brand` and `model` columns listed.

## Update Existing Products (Optional)

If you have existing products, you may want to split their names into brand and model:

```sql
-- Example: Update existing products
-- Adjust the logic based on your product naming convention

UPDATE public.products
SET 
  brand = split_part(name, ' ', 1),
  model = substring(name from position(' ' in name) + 1)
WHERE brand IS NULL;
```

## Next Steps

After applying the migration:
1. Restart your development server: `npm run dev`
2. Go to the Admin panel
3. Add new products with Brand and Model fields
4. Test the new filtering features
