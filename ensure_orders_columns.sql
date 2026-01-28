-- Ensure orders table has all required columns

-- Add batch_id column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Add variant_image column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;

-- Verify all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
