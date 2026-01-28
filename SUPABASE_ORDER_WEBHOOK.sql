-- SUPABASE SQL: ORDER NOTIFICATION WEBHOOK
-- This sends order data to Zapier when orders are inserted

-- Step 1: Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Step 2: Drop existing triggers and functions
DROP TRIGGER IF EXISTS order_notification_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_notification();

-- Step 3: Create function to send webhook
CREATE OR REPLACE FUNCTION send_order_notification()
RETURNS TRIGGER AS $$
DECLARE
  http_response record;
  user_profile record;
  order_data jsonb;
  orders_array jsonb;
BEGIN
  -- Get user profile (shop details)
  SELECT shop_name, shop_address INTO user_profile
  FROM user_profiles
  WHERE id = NEW.user_id;

  -- If this is a batch order (multiple items), group them
  IF NEW.batch_id IS NOT NULL THEN
    -- Get all orders in this batch
    SELECT jsonb_agg(
      jsonb_build_object(
        'product_id', o.product_id,
        'quantity', o.quantity,
        'price', o.price,
        'variants', o.variants
      )
    ) INTO orders_array
    FROM orders o
    WHERE o.batch_id = NEW.batch_id;
    
    -- Calculate total amount
    SELECT SUM(o.quantity * o.price) INTO order_data
    FROM orders o
    WHERE o.batch_id = NEW.batch_id;
    
  ELSE
    -- Single order (Buy Now)
    orders_array := jsonb_build_array(
      jsonb_build_object(
        'product_id', NEW.product_id,
        'quantity', NEW.quantity,
        'price', NEW.price,
        'variants', NEW.variants
      )
    );
    
    order_data := (NEW.quantity * NEW.price)::jsonb;
  END IF;

  -- Send webhook to Zapier
  SELECT * FROM extensions.http_post(
    url := 'YOUR_ZAPIER_WEBHOOK_URL',
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'shop_name', user_profile.shop_name,
      'shop_address', user_profile.shop_address,
      'batch_id', COALESCE(NEW.batch_id::text, 'N/A'),
      'total_items', (SELECT COUNT(*) FROM orders WHERE batch_id = NEW.batch_id OR id = NEW.id),
      'total_amount', order_data,
      'orders', orders_array,
      'ordered_at', NEW.created_at,
      'event_type', 'order_placed'
    )::text,
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) INTO http_response;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger
-- Only trigger on INSERT (new orders)
-- Only trigger once per batch (check if it's the first order in batch)
CREATE TRIGGER order_notification_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (
    NEW.batch_id IS NULL OR 
    (SELECT COUNT(*) FROM orders WHERE batch_id = NEW.batch_id) = 1
  )
  EXECUTE FUNCTION send_order_notification();

-- Step 5: Verify setup
SELECT 'Setup complete! Replace YOUR_ZAPIER_WEBHOOK_URL with your actual webhook URL.' AS status;
