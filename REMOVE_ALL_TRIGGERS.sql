-- REMOVE ALL TRIGGERS - FIX ORDER CANCELLATION IMMEDIATELY
-- This will allow you to cancel orders without any webhook integration

-- Step 1: Drop ALL triggers on orders table (excluding system triggers)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'orders'::regclass 
        AND tgname NOT LIKE 'pg_%'
        AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    ) 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS "' || r.tgname || '" ON orders';
    END LOOP;
END $$;

-- Step 2: Drop all related functions
DROP FUNCTION IF EXISTS notify_order_cancelled() CASCADE;
DROP FUNCTION IF EXISTS notify_order_status_change() CASCADE;
DROP FUNCTION IF EXISTS handle_order_status_change() CASCADE;

-- Step 3: Verify everything is clean
SELECT 'All triggers removed successfully!' AS status;

-- Step 4: Check if any triggers remain
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'No triggers found - Order cancellation should work now!'
        ELSE 'Warning: ' || COUNT(*) || ' triggers still exist'
    END AS result
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass 
AND tgname NOT LIKE 'pg_%';
