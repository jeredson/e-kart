-- Run this SQL in Supabase SQL Editor

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
