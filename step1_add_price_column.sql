-- STEP 1: Add price column to orders table
-- Run this FIRST in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'price';
