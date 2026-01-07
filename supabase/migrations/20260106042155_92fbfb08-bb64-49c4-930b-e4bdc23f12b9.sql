-- Add featured column to products table for carousel selection
ALTER TABLE public.products 
ADD COLUMN featured boolean DEFAULT false;