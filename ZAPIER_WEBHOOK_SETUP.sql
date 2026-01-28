-- STEP 1: Enable HTTP Extension (REQUIRED!)
-- Run this first and wait for it to complete
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- STEP 2: Verify the extension is installed
-- You should see "http" in the results
SELECT * FROM pg_extension WHERE extname = 'http';

-- STEP 3: Remove old triggers
DROP TRIGGER IF EXISTS order_cancel_webhook ON orders;
DROP FUNCTION IF EXISTS send_cancel_webhook() CASCADE;

-- STEP 4: Create the webhook function
-- REPLACE 'YOUR_ZAPIER_WEBHOOK_URL' with your actual Zapier webhook URL
CREATE OR REPLACE FUNCTION send_cancel_webhook()
RETURNS TRIGGER AS $$
DECLARE
  http_request_id integer;
  http_response record;
BEGIN
  -- Only when order is cancelled
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    
    -- Call Zapier webhook
    SELECT * FROM extensions.http_post(
      url := 'YOUR_ZAPIER_WEBHOOK_URL',
      body := json_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'product_id', NEW.product_id,
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name,
        'created_at', NEW.created_at
      )::text,
      headers := '{"Content-Type": "application/json"}'::jsonb
    ) INTO http_response;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Create the trigger
CREATE TRIGGER order_cancel_webhook
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_cancel_webhook();

-- STEP 6: Verify trigger was created
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass 
AND tgname = 'order_cancel_webhook';

-- You should see: order_cancel_webhook | O
-- If you see this, the trigger is active!
