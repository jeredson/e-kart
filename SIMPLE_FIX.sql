-- SIMPLE FIX: Remove the problematic trigger manually
-- Run this entire script

-- Drop only user-created triggers (not system triggers)
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

-- Drop the functions
DROP FUNCTION IF EXISTS notify_order_cancelled() CASCADE;
DROP FUNCTION IF EXISTS notify_order_status_change() CASCADE;
DROP FUNCTION IF EXISTS handle_order_status_change() CASCADE;

-- Verify it worked
SELECT 'Triggers removed! Try canceling an order now.' AS status;
