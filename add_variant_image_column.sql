-- Add variant_image column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;
