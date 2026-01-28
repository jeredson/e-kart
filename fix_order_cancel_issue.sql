-- Step 1: Drop all existing triggers and functions related to order cancellation
DROP TRIGGER IF EXISTS order_cancelled_trigger ON orders;
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
DROP TRIGGER IF EXISTS notify_order_status_change ON orders;

DROP FUNCTION IF EXISTS notify_order_cancelled();
DROP FUNCTION IF EXISTS notify_order_status_change();
DROP FUNCTION IF EXISTS handle_order_status_change();

-- Step 2: Check what triggers currently exist on orders table
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass;

-- Step 3: List all functions that might be interfering
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%order%' AND proname LIKE '%cancel%';
