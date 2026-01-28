-- BATCH ORDER WEBHOOK: Groups multiple products from checkout
-- Sends ONE webhook with ALL products when checkout is completed

-- Step 1: Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Step 2: Drop existing triggers
DROP TRIGGER IF EXISTS order_notification_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_notification();

-- Step 3: Create batch webhook function
CREATE OR REPLACE FUNCTION send_order_notification()
RETURNS TRIGGER AS $$
DECLARE
  http_response record;
  orders_array jsonb;
  total_amount numeric;
  total_items integer;
  is_first_in_batch boolean;
BEGIN
  -- Only process INSERT operations
  IF TG_OP = 'INSERT' THEN
    
    -- Check if this is a batch order (checkout) or single order (buy now)
    IF NEW.batch_id IS NOT NULL THEN
      -- For batch orders, only send webhook for the LAST order in the batch
      -- We use a small delay to ensure all orders are inserted
      PERFORM pg_sleep(0.5);
      
      -- Check if there are any more orders being inserted for this batch
      -- by checking if this is the most recent order
      SELECT NEW.id = MAX(id) INTO is_first_in_batch
      FROM orders
      WHERE batch_id = NEW.batch_id;
      
      IF is_first_in_batch THEN
        -- Get all orders in this batch
        SELECT 
          jsonb_agg(
            jsonb_build_object(
              'product_id', product_id,
              'quantity', quantity,
              'price', price,
              'variants', variants
            )
          ),
          SUM(quantity * price),
          COUNT(*)
        INTO orders_array, total_amount, total_items
        FROM orders
        WHERE batch_id = NEW.batch_id;
        
        -- Send webhook with all products
        SELECT * FROM extensions.http_post(
          url := 'https://hooks.zapier.com/hooks/catch/26132431/ulyfcdm/',
          body := jsonb_build_object(
            'user_id', NEW.user_id,
            'shop_name', NEW.shop_name,
            'shop_address', NEW.shop_address,
            'batch_id', NEW.batch_id,
            'total_items', total_items,
            'total_amount', total_amount,
            'orders', orders_array,
            'ordered_at', NEW.created_at,
            'event_type', 'order_placed'
          )::text,
          headers := '{"Content-Type": "application/json"}'::jsonb
        ) INTO http_response;
      END IF;
      
    ELSE
      -- Single order (Buy Now) - send immediately
      SELECT * FROM extensions.http_post(
        url := 'YOUR_ZAPIER_WEBHOOK_URL',
        body := jsonb_build_object(
          'user_id', NEW.user_id,
          'shop_name', NEW.shop_name,
          'shop_address', NEW.shop_address,
          'batch_id', 'N/A',
          'total_items', 1,
          'total_amount', NEW.quantity * NEW.price,
          'orders', jsonb_build_array(
            jsonb_build_object(
              'product_id', NEW.product_id,
              'quantity', NEW.quantity,
              'price', NEW.price,
              'variants', NEW.variants
            )
          ),
          'ordered_at', NEW.created_at,
          'event_type', 'order_placed'
        )::text,
        headers := '{"Content-Type": "application/json"}'::jsonb
      ) INTO http_response;
    END IF;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger
CREATE TRIGGER order_notification_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_notification();

-- Step 5: Verify
SELECT 'Trigger created! Replace YOUR_ZAPIER_WEBHOOK_URL with your webhook URL.' AS status;
