-- SQL CODE TO SEND ORDER DATA TO ZAPIER WEBHOOK
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================
-- STEP 1: Create view with all order data
-- ============================================
CREATE OR REPLACE VIEW order_email_data AS
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
    p.model,
    CASE 
        WHEN o.batch_id IS NULL THEN 'single'
        ELSE 'batch'
    END as order_type
FROM orders o
LEFT JOIN products p ON o.product_id = p.id;

GRANT SELECT ON order_email_data TO anon, authenticated;

-- ============================================
-- STEP 2: Function to send single product data to Zapier
-- ============================================
CREATE OR REPLACE FUNCTION send_single_order_to_zapier()
RETURNS TRIGGER AS $$
DECLARE
    order_data json;
    webhook_url text := 'https://hooks.zapier.com/hooks/catch/26132431/uqxjcfi/'; -- Replace with your Zapier webhook URL
BEGIN
    -- Only process if batch_id is NULL (Buy Now orders)
    IF NEW.batch_id IS NULL THEN
        -- Get order data with product details
        SELECT row_to_json(t) INTO order_data
        FROM (
            SELECT 
                order_id,
                product_name,
                brand,
                model,
                variants,
                quantity,
                unit_price,
                subtotal,
                shop_name,
                shop_address,
                ordered_on,
                order_type
            FROM order_email_data
            WHERE order_id = NEW.id
        ) t;
        
        -- Send to Zapier webhook
        PERFORM net.http_post(
            url := webhook_url,
            headers := jsonb_build_object('Content-Type', 'application/json'),
            body := order_data::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Function to send multiple products data to Zapier
-- ============================================
CREATE OR REPLACE FUNCTION send_batch_orders_to_zapier()
RETURNS TRIGGER AS $$
DECLARE
    batch_data json;
    webhook_url text := 'YOUR_ZAPIER_WEBHOOK_URL_HERE'; -- Replace with your Zapier webhook URL
    products_array json;
    total_amount numeric;
    product_count integer;
BEGIN
    -- Only process if batch_id exists (Checkout orders)
    IF NEW.batch_id IS NOT NULL THEN
        -- Get all orders in the batch
        SELECT 
            json_agg(
                json_build_object(
                    'order_id', order_id,
                    'product_name', product_name,
                    'brand', brand,
                    'model', model,
                    'variants', variants,
                    'quantity', quantity,
                    'unit_price', unit_price,
                    'subtotal', subtotal
                )
            ),
            SUM(subtotal),
            COUNT(*)
        INTO products_array, total_amount, product_count
        FROM order_email_data
        WHERE batch_id = NEW.batch_id;
        
        -- Build complete batch data
        SELECT json_build_object(
            'order_type', 'batch',
            'batch_id', NEW.batch_id,
            'shop_name', NEW.shop_name,
            'shop_address', NEW.shop_address,
            'ordered_on', TO_CHAR(NEW.created_at, 'DD/MM/YYYY'),
            'products', products_array,
            'total', total_amount,
            'product_count', product_count
        ) INTO batch_data;
        
        -- Send to Zapier webhook
        PERFORM net.http_post(
            url := webhook_url,
            headers := jsonb_build_object('Content-Type', 'application/json'),
            body := batch_data::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: Create triggers
-- ============================================

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS trigger_single_order_zapier ON orders;
DROP TRIGGER IF EXISTS trigger_batch_order_zapier ON orders;

-- Trigger for single orders (Buy Now)
CREATE TRIGGER trigger_single_order_zapier
    AFTER INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.batch_id IS NULL)
    EXECUTE FUNCTION send_single_order_to_zapier();

-- Trigger for batch orders (Checkout)
CREATE TRIGGER trigger_batch_order_zapier
    AFTER INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.batch_id IS NOT NULL)
    EXECUTE FUNCTION send_batch_orders_to_zapier();

-- ============================================
-- DONE! 
-- ============================================

-- Now update the webhook URLs in the functions above with your actual Zapier webhook URL
-- The triggers will automatically send data to Zapier when orders are created
