-- Alternative: Simple webhook-based notification
-- This approach uses Supabase's built-in webhook feature instead of Edge Functions

-- Step 1: Enable the http extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS http;

-- Step 2: Create a function to send webhook notification
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE'; -- Replace with your webhook URL
  http_response http_response;
BEGIN
  -- Fetch product details
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = NEW.product_id;
  
  -- Format variants
  SELECT string_agg(key || ': ' || value, ', ')
  INTO variant_text
  FROM jsonb_each_text(NEW.variants);
  
  -- Send webhook (async, won't block order creation)
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
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the order
    RAISE WARNING 'Webhook failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();

-- To use this:
-- 1. Replace 'YOUR_WEBHOOK_URL_HERE' with your actual webhook URL
-- 2. Use services like:
--    - Zapier (create a webhook trigger, then add Gmail/email action)
--    - Make.com (similar to Zapier)
--    - n8n (self-hosted automation)
--    - Your own API endpoint that sends emails
