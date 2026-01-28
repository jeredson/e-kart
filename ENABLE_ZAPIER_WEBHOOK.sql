-- ENABLE ZAPIER WEBHOOK FOR ORDER NOTIFICATIONS
-- This sends order data to Zapier which handles formatting

-- Clean up existing triggers
DROP TRIGGER IF EXISTS order_notification_trigger ON orders;
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP FUNCTION IF EXISTS send_order_notification() CASCADE;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;

-- Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Create simple webhook function
CREATE OR REPLACE FUNCTION send_order_to_zapier()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/ulyfcdm/'; -- Replace with your Zapier webhook URL
  http_response http_response;
BEGIN
  -- Send order data to Zapier
  SELECT * INTO http_response FROM http_post(
    webhook_url,
    jsonb_build_object(
      'order_id', NEW.id,
      'batch_id', NEW.id,
      'product_id', NEW.product_id,
      'quantity', NEW.quantity,
      'price', NEW.price,
      'variants', NEW.variants,
      'shop_name', NEW.shop_name,
      'shop_address', NEW.shop_address,
      'created_at', NEW.created_at
    )::text,
    'application/json'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block order if webhook fails
    RAISE WARNING 'Zapier webhook failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER order_to_zapier_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_to_zapier();

-- Verify
SELECT 'Zapier webhook enabled. Update webhook_url in function.' AS status;
