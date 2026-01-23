-- COMPLETE FIX: Add price to orders and update webhook
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Add price column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Step 2: Drop and recreate webhook function with price
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;

CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/uq6xigu/';
  http_response http_response;
BEGIN
  RAISE NOTICE 'Order webhook trigger fired for order: %', NEW.id;
  RAISE NOTICE 'Price value: %', NEW.price;
  
  -- Fetch product details
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = NEW.product_id;
  
  -- Format variants
  SELECT string_agg(key || ': ' || value, ', ')
  INTO variant_text
  FROM jsonb_each_text(NEW.variants);
  
  -- Send webhook with price field
  BEGIN
    SELECT * INTO http_response FROM http_post(
      webhook_url,
      jsonb_build_object(
        'order_id', NEW.id,
        'brand', COALESCE(product_data.brand, 'N/A'),
        'model', COALESCE(product_data.model, product_data.name, 'N/A'),
        'product_name', product_data.name,
        'variants', COALESCE(variant_text, 'None'),
        'quantity', NEW.quantity,
        'price', COALESCE(NEW.price, 0),
        'subtotal', COALESCE(NEW.quantity * NEW.price, 0),
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'created_at', NEW.created_at
      )::text,
      'application/json'
    );
    
    RAISE NOTICE 'Webhook sent with price: % and subtotal: %', NEW.price, NEW.quantity * NEW.price;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Webhook failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Recreate trigger
DROP TRIGGER IF EXISTS on_order_webhook ON orders;

CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();

-- Step 4: Verify
SELECT 'Setup complete! Price column added and webhook updated.' as status;
SELECT 'Now place a NEW order to test.' as next_step;
