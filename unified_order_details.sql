-- UNIFIED ORDER DETAILS FOR ZAPIER
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================
-- Create function to get order details (works for both single and batch)
-- ============================================
CREATE OR REPLACE FUNCTION get_order_details(p_order_id text, p_batch_id text DEFAULT NULL)
RETURNS TABLE (
    order_details text,
    shop_name text,
    shop_address text,
    batch_id text,
    ordered_on text,
    total numeric
) AS $$
DECLARE
    details_text text := '';
    total_amount numeric := 0;
    r record;
    order_uuid uuid;
    batch_uuid uuid;
BEGIN
    -- Convert text to uuid, handle empty strings
    order_uuid := CASE WHEN p_order_id = '' OR p_order_id IS NULL THEN NULL ELSE p_order_id::uuid END;
    batch_uuid := CASE WHEN p_batch_id = '' OR p_batch_id IS NULL THEN NULL ELSE p_batch_id::uuid END;
    
    -- If batch_id exists, get all orders in batch
    -- If batch_id is null, get single order
    FOR r IN 
        SELECT * FROM order_email_data 
        WHERE (batch_uuid IS NOT NULL AND order_email_data.batch_id = batch_uuid)
           OR (batch_uuid IS NULL AND order_id = order_uuid)
        ORDER BY order_id
    LOOP
        total_amount := total_amount + r.subtotal;
        
        -- Build product details text
        details_text := details_text || format(
            E'product_name: %s\nvariant: %s\nquantity: %s\nunit_price: %s\nsubtotal: %s\n\n',
            r.product_name,
            r.variants,
            r.quantity,
            r.unit_price,
            r.subtotal
        );
    END LOOP;
    
    -- Get shop details from first matching order
    RETURN QUERY
    SELECT 
        details_text,
        o.shop_name,
        o.shop_address,
        o.batch_id::text,
        TO_CHAR(o.created_at, 'DD/MM/YYYY'),
        total_amount
    FROM orders o
    WHERE (batch_uuid IS NOT NULL AND o.batch_id = batch_uuid)
       OR (batch_uuid IS NULL AND o.id = order_uuid)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_order_details(text, text) TO anon, authenticated;

-- ============================================
-- DONE!
-- ============================================

/*
HOW TO USE IN ZAPIER:

Step 1: Webhook Trigger (from Supabase Database Webhook)
  - Receives: record.id, record.batch_id, etc.

Step 2: Webhooks by Zapier - POST Request
  URL: https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/rpc/get_order_details
  Method: POST
  Headers:
    - apikey: YOUR_SUPABASE_ANON_KEY
    - Authorization: Bearer YOUR_SUPABASE_ANON_KEY
    - Content-Type: application/json
  Body:
    {
      "p_order_id": "{{record__id}}",
      "p_batch_id": "{{record__batch_id}}"
    }

Step 3: Use in Email
  - Order Details: {{2__order_details}}
  - Shop Name: {{2__shop_name}}
  - Shop Address: {{2__shop_address}}
  - Batch ID: {{2__batch_id}}
  - Ordered On: {{2__ordered_on}}
  - Total: ₹{{2__total}}

EXAMPLE OUTPUT:

For Single Product (Buy Now):
order_details: "product_name: Oppo K13 5g
variant: {"Ram": "8GB", "Color": "Icy purple", "Storage": "128GB"}
quantity: 1
unit_price: 19999
subtotal: 19999

"

For Multiple Products (Checkout):
order_details: "product_name: Oppo K13 5g
variant: {"Ram": "8GB", "Color": "Icy purple", "Storage": "128GB"}
quantity: 1
unit_price: 19999
subtotal: 19999

product_name: Samsung Galaxy S21
variant: {"Ram": "12GB", "Color": "Black", "Storage": "256GB"}
quantity: 2
unit_price: 45000
subtotal: 90000

"
*/
