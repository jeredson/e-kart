-- Add pricing fields to products table
ALTER TABLE public.products 
ADD COLUMN original_price DECIMAL(10, 2),
ADD COLUMN discounted_price DECIMAL(10, 2),
ADD COLUMN variant_pricing JSONB,
ADD COLUMN variant_exceptions JSONB;

-- Update existing products to use price as discounted_price
UPDATE public.products 
SET discounted_price = price, original_price = price
WHERE discounted_price IS NULL;
