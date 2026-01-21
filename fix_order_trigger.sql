-- Fix: Remove the broken trigger and function
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS send_order_webhook();
DROP FUNCTION IF EXISTS notify_admin_new_order();

-- Now run the updated add_order_webhook_simple.sql file
