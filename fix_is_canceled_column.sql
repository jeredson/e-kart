-- Ensure is_canceled column exists with proper default
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_canceled BOOLEAN DEFAULT false;

-- Update any NULL values to false
UPDATE orders SET is_canceled = false WHERE is_canceled IS NULL;

-- Verify the column
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('is_canceled', 'is_delivered');

-- Check sample data
SELECT id, is_delivered, is_canceled, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
