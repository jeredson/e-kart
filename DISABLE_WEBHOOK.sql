-- DISABLE WEBHOOK TRIGGER
-- Run this to allow orders to be placed without webhook

-- Drop the trigger
DROP TRIGGER IF EXISTS order_notification_trigger ON orders;

-- Drop the function
DROP FUNCTION IF EXISTS send_order_notification();

-- Verify
SELECT 'Webhook trigger removed. Orders can now be placed normally.' AS status;

-- Check if any triggers remain
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass 
AND tgname NOT LIKE 'pg_%'
AND tgname NOT LIKE 'RI_ConstraintTrigger_%';
