-- DISABLE TRIGGERS CAUSING 500 ERROR
-- Run this immediately in Supabase Dashboard → SQL Editor

DROP TRIGGER IF EXISTS trigger_single_order_zapier ON orders;
DROP TRIGGER IF EXISTS trigger_batch_order_zapier ON orders;
DROP FUNCTION IF EXISTS send_single_order_to_zapier();
DROP FUNCTION IF EXISTS send_batch_orders_to_zapier();

-- This will stop the 500 errors
-- You can still use the view for Zapier manually
