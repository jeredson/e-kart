-- Complete database update including variant_stock column
-- Run this in Supabase SQL Editor

-- Add all missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discounted_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS variant_pricing JSONB,
ADD COLUMN IF NOT EXISTS variant_exceptions JSONB,
ADD COLUMN IF NOT EXISTS variant_stock JSONB;

-- Update existing products with default values
UPDATE public.products 
SET discounted_price = price, 
    original_price = price,
    variant_stock = '{}'::jsonb
WHERE discounted_price IS NULL OR variant_stock IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.products.variant_stock IS 'JSON object storing stock quantities for product variants. Format: {"Color: Black | RAM: 8GB | Storage: 128GB": 12}';
COMMENT ON COLUMN public.products.variant_pricing IS 'JSON object storing pricing for product variants. Format: {"variants": {"8GB_128GB": 25000}}';