-- Add variant_stock column to products table for variant-based stock management
-- Run this SQL in Supabase SQL Editor

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variant_stock JSONB;

-- Add comment to explain the variant_stock column structure
COMMENT ON COLUMN public.products.variant_stock IS 'JSON object storing stock quantities for product variants. Format: {"Color: Black | RAM: 8GB | Storage: 128GB": 12, "Color: White | RAM: 6GB | Storage: 256GB": 10}';

-- Update existing products to have empty variant_stock if null
UPDATE public.products 
SET variant_stock = '{}'::jsonb
WHERE variant_stock IS NULL;