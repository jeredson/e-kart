-- Add brand and model columns to products table
ALTER TABLE public.products 
ADD COLUMN brand TEXT,
ADD COLUMN model TEXT;

-- Add indexes for better filtering performance
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_price ON public.products(price);
