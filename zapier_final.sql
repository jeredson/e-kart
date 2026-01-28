-- ZAPIER WEBHOOK INTEGRATION - FINAL VERSION
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================
-- STEP 1: Drop old view and create new one
-- ============================================
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

-- ============================================
-- STEP 2: Function for SINGLE product (Buy Now)
-- ============================================
CREATE OR REPLACE FUNCTION send_single_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url text := 'https://hooks.zapier.com/hooks/catch/26132431/uqxjcfi/';
    order_data jsonb;
BEGIN
    -- Only for Buy Now orders (no batch_id)
    IF NEW.batch_id IS NULL THEN
        -- Build single product data
        SELECT jsonb_build_object(
            'order_type', 'single',
            'order_id', order_id,
            'product_name', product_name,
            'brand', brand,
            'model', model,
            'variants', variants,
            'quantity', quantity,
            'unit_price', unit_price,
            'subtotal', subtotal,
            'shop_name', shop_name,
            'shop_address', shop_address,
            'ordered_on', ordered_on
        ) INTO order_data
        FROM order_email_data
        WHERE order_id = NEW.id;
        
        -- Send to Zapier
        PERFORM net.http_post(
            url := webhook_url,
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := order_data
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Function for MULTIPLE products (Checkout)
-- ============================================
CREATE OR REPLACE FUNCTION send_batch_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url text := 'https://hooks.zapier.com/hooks/catch/26132431/uqxjcfi/';
    batch_data jsonb;
    products_text text := '';
    total_amount numeric := 0;
    product_count integer := 0;
    shop_name_val text;
    shop_address_val text;
    ordered_on_val text;
    r record;
BEGIN
    -- Only for Checkout orders (has batch_id)
    IF NEW.batch_id IS NOT NULL THEN
        -- Loop through all products and build text
        FOR r IN 
            SELECT * FROM order_email_data 
            WHERE batch_id = NEW.batch_id
            ORDER BY order_id
        LOOP
            product_count := product_count + 1;
            total_amount := total_amount + r.subtotal;
            
            -- Build product details text
            products_text := products_text || format(
                E'product_name: %s\nvariant: %s\nquantity: %s\nunit_price: %s\nsubtotal: %s\n\n',
                r.product_name,
                r.variants,
                r.quantity,
                r.unit_price,
                r.subtotal
            );
            
            -- Get common details from first record
            IF product_count = 1 THEN
                shop_name_val := r.shop_name;
                shop_address_val := r.shop_address;
                ordered_on_val := r.ordered_on;
            END IF;
        END LOOP;
        
        -- Build batch data with products as text
        batch_data := jsonb_build_object(
            'order_type', 'batch',
            'batch_id', NEW.batch_id,
            'product_count', product_count,
            'order_details', products_text,
            'total', total_amount,
            'shop_name', shop_name_val,
            'shop_address', shop_address_val,
            'ordered_on', ordered_on_val
        );
        
        -- Send to Zapier
        PERFORM net.http_post(
            url := webhook_url,
            headers := '"Content-Type": "application/json"}'::jsonb,
            body := batch_data
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: Create triggers
-- ============================================
DROP TRIGGER IF EXISTS webhook_single_order ON orders;
DROP TRIGGER IF EXISTS webhook_batch_order ON orders;

-- Trigger for Buy Now (single product)
CREATE TRIGGER webhook_single_order
    AFTER INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.batch_id IS NULL)
    EXECUTE FUNCTION send_single_order_webhook();

-- Trigger for Checkout (batch products)
CREATE TRIGGER webhook_batch_order
    AFTER INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.batch_id IS NOT NULL)
    EXECUTE FUNCTION send_batch_order_webhook();

-- ============================================
-- DONE!
-- ============================================

/*
ZAPIER DATA STRUCTURE:

BUY NOW (Single Product):
{
  "order_type": "single",
  "order_id": "uuid",
  "product_name": "Product Name",
  "brand": "Brand",
  "model": "Model",
  "variants": "{Color: Red, Ram: 8GB}",
  "quantity": 1,
  "unit_price": 25000,
  "subtotal": 25000,
  "shop_name": "Shop Name",
  "shop_address": "Address",
  "ordered_on": "27/01/2024"
}

CHECKOUT (Multiple Products):
{
  "order_type": "batch",
  "batch_id": "uuid",
  "product_count": 2,
  "order_details": "product_name: Oppo K13 5g\nvariant: {\"Ram\": \"8GB\", \"Color\": \"Icy purple\", \"Storage\": \"128GB\"}\nquantity: 1\nunit_price: 19999\nsubtotal: 19999\n\nproduct_name: Samsung Galaxy S21\nvariant: {\"Ram\": \"12GB\", \"Color\": \"Black\", \"Storage\": \"256GB\"}\nquantity: 2\nunit_price: 45000\nsubtotal: 90000\n\n",
  "total": 109999,
  "shop_name": "Shop Name",
  "shop_address": "Address",
  "ordered_on": "27/01/2024"
}

In Zapier, use {{order_details}} directly in email - it's already formatted!
*/
