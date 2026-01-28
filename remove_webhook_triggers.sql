-- REMOVE ALL WEBHOOK TRIGGERS TO FIX ORDER CANCELLATION
-- Run this if you want to cancel orders without Zapier integration

-- Drop all existing triggers and functions
DROP TRIGGER IF EXISTS order_cancelled_trigger ON orders;
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
DROP TRIGGER IF EXISTS notify_order_status_change ON orders;

DROP FUNCTION IF EXISTS notify_order_cancelled();
DROP FUNCTION IF EXISTS notify_order_status_change();
DROP FUNCTION IF EXISTS handle_order_status_change();

-- Verify all triggers are removed
SELECT 'All triggers removed. Order cancellation should work now.' AS status;

-- Check remaining triggers on orders table
SELECT tgname AS trigger_name, tgenabled AS enabled
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass
AND tgname NOT LIKE 'pg_%';
