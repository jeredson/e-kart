-- Add is_canceled column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_canceled BOOLEAN DEFAULT false;

-- Verify column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'is_canceled';
