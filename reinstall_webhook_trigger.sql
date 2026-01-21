-- Complete reinstall of webhook trigger for email notifications

-- Step 1: Clean up everything
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS notify_admin_new_order() CASCADE;

-- Step 2: Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Step 3: Create the webhook function
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/uq6xigu/'; -- REPLACE THIS WITH YOUR ZAPIER WEBHOOK URL
  http_response http_response;
BEGIN
  -- Log that trigger fired
  RAISE NOTICE 'Order webhook trigger fired for order: %', NEW.id;
  
  -- Fetch product details
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = NEW.product_id;
  
  RAISE NOTICE 'Product data: %, %, %', product_data.name, product_data.brand, product_data.model;
  
  -- Format variants
  SELECT string_agg(key || ': ' || value, ', ')
  INTO variant_text
  FROM jsonb_each_text(NEW.variants);
  
  RAISE NOTICE 'Variants: %', variant_text;
  RAISE NOTICE 'Webhook URL: %', webhook_url;
  
  -- Send webhook
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
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'created_at', NEW.created_at
      )::text,
      'application/json'
    );
    
    RAISE NOTICE 'Webhook response status: %', http_response.status;
    RAISE NOTICE 'Webhook response: %', http_response.content;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Webhook failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();

-- Step 5: Verify installation
SELECT 
  'Trigger created: ' || tgname as status
FROM pg_trigger 
WHERE tgname = 'on_order_webhook';

-- Instructions:
-- 1. Replace 'YOUR_WEBHOOK_URL_HERE' with your actual Zapier webhook URL
-- 2. Run this entire script in Supabase SQL Editor
-- 3. Place a test order
-- 4. Check the logs in Supabase Dashboard > Database > Logs
-- 5. Look for NOTICE messages showing the webhook was called
