-- IMMEDIATE FIX - Run this NOW to stop 400 errors
-- Supabase Dashboard → SQL Editor

DROP TRIGGER IF EXISTS webhook_single_order ON orders;
DROP TRIGGER IF EXISTS webhook_batch_order ON orders;
DROP TRIGGER IF EXISTS trigger_single_order_zapier ON orders;
DROP TRIGGER IF EXISTS trigger_batch_order_zapier ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP TRIGGER IF EXISTS on_order_batch_webhook ON orders;

DROP FUNCTION IF EXISTS send_single_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS send_batch_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS send_single_order_to_zapier() CASCADE;
DROP FUNCTION IF EXISTS send_batch_orders_to_zapier() CASCADE;
DROP FUNCTION IF EXISTS notify_new_order() CASCADE;

-- Verify all triggers are gone
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'orders';
-- Should return no rows
