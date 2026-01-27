-- Complete Fix for Email Notifications on Buy Now Orders
-- This uses the webhook approach which is simpler and more reliable

-- Step 1: Clean up any existing triggers
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS notify_admin_new_order() CASCADE;

-- Step 2: Enable http extension (required for webhooks)
CREATE EXTENSION IF NOT EXISTS http;

-- Step 3: Create the webhook function
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE'; -- REPLACE THIS WITH YOUR ACTUAL WEBHOOK URL
  http_response http_response;
BEGIN
  -- Fetch product details including brand and model
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = NEW.product_id;
  
  -- Format variants as readable text (e.g., "Color: Blue, Ram: 8GB, Storage: 128GB")
  SELECT string_agg(key || ': ' || value, ', ' ORDER BY key)
  INTO variant_text
  FROM jsonb_each_text(NEW.variants);
  
  -- Send webhook notification (wrapped in exception handler so it doesn't fail orders)
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
    
    -- Log success
    RAISE NOTICE 'Webhook sent successfully for order %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the order
      RAISE WARNING 'Webhook notification failed for order %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger (AFTER INSERT so it doesn't block order creation)
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();

-- Step 5: Verify setup
SELECT 
  'Trigger created successfully' as status,
  'Next steps:' as action,
  '1. Replace YOUR_WEBHOOK_URL_HERE with your actual webhook URL' as step1,
  '2. Set up Zapier/Make.com webhook to receive the data' as step2,
  '3. Configure email action in Zapier/Make.com' as step3;

-- To test: Place an order and check if webhook is called
-- You can also check PostgreSQL logs for any errors
