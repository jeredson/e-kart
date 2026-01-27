-- IMMEDIATE FIX FOR 400 ERROR
-- The error is caused by a trigger function trying to use invalid parameters
-- Run this NOW in Supabase Dashboard -> SQL Editor

-- Remove the problematic trigger and function
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS notify_new_order();

-- That's it! Now test Buy Now and Checkout - they should work!
