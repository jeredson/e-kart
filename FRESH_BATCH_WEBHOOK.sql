-- FRESH START: Batch webhook with products array for Zapier

DROP TRIGGER IF EXISTS order_notification_trigger ON orders;
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS batch_to_zapier_trigger ON orders;
DROP TRIGGER IF EXISTS send_batch_webhook_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_notification() CASCADE;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS send_batch_to_zapier() CASCADE;
DROP FUNCTION IF EXISTS send_batch_webhook() CASCADE;

CREATE EXTENSION IF NOT EXISTS http;

-- Function sends webhook ONLY for first order in batch
CREATE OR REPLACE FUNCTION send_batch_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/ulo3lob/';
  batch_orders JSONB;
  http_response http_response;
  order_count INT;
BEGIN
  -- Check if this is the first order in the batch
  SELECT COUNT(*) INTO order_count
  FROM orders
  WHERE batch_id = NEW.batch_id;
  
  -- Only send webhook for the first order
  IF order_count > 1 THEN
    RETURN NEW;
  END IF;
  
  -- Wait a moment for all batch orders to be inserted
  PERFORM pg_sleep(0.5);
  
  -- Collect all orders in this batch with product details
  SELECT jsonb_build_object(
    'batch_id', NEW.batch_id,
    'shop_name', NEW.shop_name,
    'shop_address', NEW.shop_address,
    'created_at', NEW.created_at,
    'products', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', COALESCE(p.brand || ' ' || p.model, p.name),
          'variants', o.variants,
          'quantity', o.quantity,
          'price', o.price
        )
      )
      FROM orders o
      JOIN products p ON p.id = o.product_id
      WHERE o.batch_id = NEW.batch_id
    )
  ) INTO batch_orders;

  -- Send to Zapier
  SELECT * INTO http_response FROM http_post(
    webhook_url,
    batch_orders::text,
    'application/json'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Webhook failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER send_batch_webhook_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_batch_webhook();

SELECT 'Batch webhook enabled - Update webhook_url' AS status;
