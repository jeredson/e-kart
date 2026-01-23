-- Add price column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Update existing orders with price from products table (optional)
-- This is only needed if you have existing orders without prices
UPDATE orders o
SET price = p.price
FROM products p
WHERE o.product_id = p.id
AND o.price IS NULL;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'price';
