-- REMOVE PROBLEMATIC TRIGGER CAUSING 400 ERROR
-- The error "unrecognized configuration parameter app.supabase_url" 
-- is coming from a trigger function that shouldn't exist

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_order_created ON orders;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS notify_new_order();

-- Verify they're gone
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'orders';

-- This should return no rows, confirming the trigger is removed
