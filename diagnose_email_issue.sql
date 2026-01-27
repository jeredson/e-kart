-- Diagnose email notification issues

-- 1. Check if pg_net extension is enabled (for Edge Function approach)
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- 2. Check if http extension is enabled (for webhook approach)
SELECT * FROM pg_extension WHERE extname = 'http';

-- 3. Check all triggers on orders table
SELECT 
  tgname AS trigger_name,
  tgenabled AS enabled,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'orders'::regclass
  AND tgname NOT LIKE 'RI_%';

-- 4. Check if configuration parameters are set (for Edge Function)
SELECT name, setting 
FROM pg_settings 
WHERE name IN ('app.supabase_url', 'app.supabase_service_role_key');

-- 5. Test if orders table has recent orders
SELECT id, created_at, product_id, shop_name 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
