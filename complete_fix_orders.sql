-- Complete fix for orders table - Run ALL of this
-- This will work whether columns exist or not

-- Add all potentially missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false;

-- Verify the fix worked
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
