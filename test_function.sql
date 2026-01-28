-- TEST THE FUNCTION
-- Run this in Supabase Dashboard → SQL Editor

-- First, check if the view has data
SELECT * FROM order_email_data ORDER BY created_at DESC LIMIT 5;

-- Test with a real order ID (replace with your actual order ID)
SELECT * FROM get_order_details('892f5ce5-826c-4ab1-8008-079d30496cab', NULL);

-- Or test with the latest order
SELECT * FROM get_order_details(
    (SELECT id::text FROM orders ORDER BY created_at DESC LIMIT 1),
    NULL
);

-- Check if the order exists in the view
SELECT * FROM order_email_data 
WHERE order_id = '892f5ce5-826c-4ab1-8008-079d30496cab';
