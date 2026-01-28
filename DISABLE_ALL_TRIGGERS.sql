-- REMOVE ALL TRIGGERS - MAKE CANCEL WORK AGAIN
-- Run this entire script to clean up everything

-- Step 1: Drop all user-created triggers on orders table
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
DROP FUNCTION IF EXISTS send_cancel_webhook() CASCADE;
DROP FUNCTION IF EXISTS notify_order_cancelled() CASCADE;
DROP FUNCTION IF EXISTS notify_order_status_change() CASCADE;
DROP FUNCTION IF EXISTS handle_order_status_change() CASCADE;
DROP FUNCTION IF EXISTS trigger_cancel_email() CASCADE;

-- Step 3: Verify all triggers are removed
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ All triggers removed - Cancel button should work now!'
        ELSE '⚠️ Warning: ' || COUNT(*) || ' triggers still exist'
    END AS status
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass 
AND tgname NOT LIKE 'pg_%'
AND tgname NOT LIKE 'RI_ConstraintTrigger_%';

-- Step 4: List remaining triggers (should be empty or only system triggers)
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass 
AND tgname NOT LIKE 'pg_%'
AND tgname NOT LIKE 'RI_ConstraintTrigger_%';
