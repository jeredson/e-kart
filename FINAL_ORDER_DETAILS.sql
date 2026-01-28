-- FINAL WORKING ORDER DETAILS FOR ZAPIER
-- Run this in Supabase Dashboard → SQL Editor

-- Drop old function first
DROP FUNCTION IF EXISTS get_order_details(text, text) CASCADE;

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
    o.created_at,
    TO_CHAR(o.created_at, 'DD/MM/YYYY') as ordered_on,
    (o.price * o.quantity) as subtotal,
    p.name as product_name,
    p.brand,
    p.model
FROM orders o
LEFT JOIN products p ON o.product_id = p.id;

GRANT SELECT ON order_email_data TO anon, authenticated;

-- Function to get order details
CREATE OR REPLACE FUNCTION get_order_details(p_order_id text, p_batch_id text DEFAULT '')
RETURNS json AS $$
DECLARE
    result json;
    order_uuid uuid;
    batch_uuid uuid;
    details_text text := '';
    r record;
BEGIN
    -- Handle empty strings
    order_uuid := NULLIF(p_order_id, '')::uuid;
    batch_uuid := NULLIF(p_batch_id, '')::uuid;
    
    -- Build details text manually
    FOR r IN 
        SELECT * FROM order_email_data
        WHERE (batch_uuid IS NOT NULL AND batch_id = batch_uuid)
           OR (batch_uuid IS NULL AND order_id = order_uuid)
    LOOP
        details_text := details_text || format(
            E'product_name: %s\nvariant: %s\nquantity: %s\nunit_price: %s\nsubtotal: %s\n\n',
            r.product_name,
            r.variants,
            r.quantity,
            r.unit_price,
            r.subtotal
        );
    END LOOP;
    
    -- Get other details
    SELECT json_build_object(
        'order_details', details_text,
        'shop_name', shop_name,
        'shop_address', shop_address,
        'batch_id', batch_id::text,
        'ordered_on', ordered_on,
        'total', subtotal
    ) INTO result
    FROM order_email_data
    WHERE (batch_uuid IS NOT NULL AND batch_id = batch_uuid)
       OR (batch_uuid IS NULL AND order_id = order_uuid)
    LIMIT 1;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_order_details(text, text) TO anon, authenticated;

-- DONE! Now use in Zapier:
-- URL: https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/rpc/get_order_details
-- Body: {"p_order_id": "{{1__Record Id}}", "p_batch_id": ""}
-- Access: {{2__order_details}}, {{2__shop_name}}, {{2__total}}
