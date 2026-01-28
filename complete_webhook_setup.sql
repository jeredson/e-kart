-- COMPLETE SETUP FOR ORDER CANCELLATION WEBHOOK
-- Run this entire script in Supabase SQL Editor

-- Step 1: Enable the http extension (required for webhooks)
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Step 2: Drop any existing triggers and functions
DROP TRIGGER IF EXISTS order_cancelled_trigger ON orders;
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
DROP TRIGGER IF EXISTS notify_order_status_change ON orders;

DROP FUNCTION IF EXISTS notify_order_cancelled();
DROP FUNCTION IF EXISTS notify_order_status_change();
DROP FUNCTION IF EXISTS handle_order_status_change();

-- Step 3: Create the webhook function
CREATE OR REPLACE FUNCTION notify_order_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Only trigger if is_canceled changed from false to true
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    SELECT extensions.http_post(
      'YOUR_ZAPIER_WEBHOOK_URL', -- Replace with your actual Zapier webhook URL
      json_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'product_id', NEW.product_id,
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name,
        'variants', NEW.variants,
        'is_delivered', NEW.is_delivered,
        'cancelled_at', NOW(),
        'created_at', NEW.created_at
      )::text,
      'application/json'
    ) INTO request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the trigger
CREATE TRIGGER order_cancelled_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_cancelled();

-- Step 5: Verify setup
SELECT 'Setup complete! Trigger created successfully.' AS status;
