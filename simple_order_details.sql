-- SIMPLE ORDER DETAILS FUNCTION - GUARANTEED TO WORK
-- Run this in Supabase Dashboard → SQL Editor

-- Drop and recreate the view
DROP VIEW IF EXISTS order_email_data CASCADE;

CREATE VIEW order_email_data AS
SELECT 
    o.id as order_id,
    o.batch_id,
    o.quantity,
    o.price as unit_price,
    o.variants::text as variants,
    o.shop_name,
    o.shop_address,
    TO_CHAR(o.created_at, 'DD/MM/YYYY') as ordered_on,
    (o.price * o.quantity) as subtotal,
    p.name as product_name,
    p.brand,
    p.model
FROM orders o
LEFT JOIN products p ON o.product_id = p.id;

GRANT SELECT ON order_email_data TO anon, authenticated;

-- Simpler function
CREATE OR REPLACE FUNCTION get_order_details(p_order_id text, p_batch_id text DEFAULT '')
RETURNS json AS $$
DECLARE
    result json;
    order_uuid uuid;
    batch_uuid uuid;
BEGIN
    -- Handle empty strings
    order_uuid := NULLIF(p_order_id, '')::uuid;
    batch_uuid := NULLIF(p_batch_id, '')::uuid;
    
    -- Build result
    SELECT json_build_object(
        'order_details', string_agg(
            format(E'product_name: %s\nvariant: %s\nquantity: %s\nunit_price: %s\nsubtotal: %s\n',
                product_name,
                variants,
                quantity,
                unit_price,
                subtotal
            ), E'\n'
        ),
        'shop_name', MAX(shop_name),
        'shop_address', MAX(shop_address),
        'batch_id', MAX(batch_id)::text,
        'ordered_on', MAX(ordered_on),
        'total', SUM(subtotal)
    ) INTO result
    FROM order_email_data
    WHERE (batch_uuid IS NOT NULL AND batch_id = batch_uuid)
       OR (batch_uuid IS NULL AND order_id = order_uuid);
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_order_details(text, text) TO anon, authenticated;

-- Test it
SELECT get_order_details(
    (SELECT id::text FROM orders ORDER BY created_at DESC LIMIT 1),
    ''
);
