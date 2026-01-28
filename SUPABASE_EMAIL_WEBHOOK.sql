-- USE SUPABASE EDGE FUNCTION INSTEAD OF ZAPIER

DROP TRIGGER IF EXISTS order_notification_trigger ON orders;
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS batch_to_zapier_trigger ON orders;
DROP TRIGGER IF EXISTS send_batch_webhook_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_notification() CASCADE;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS send_batch_to_zapier() CASCADE;
DROP FUNCTION IF EXISTS send_batch_webhook() CASCADE;

CREATE EXTENSION IF NOT EXISTS http;

CREATE OR REPLACE FUNCTION send_order_email()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT := 'YOUR_SUPABASE_PROJECT_URL/functions/v1/send-order-email';
  service_role_key TEXT := 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
  batch_orders JSONB;
  http_response http_response;
BEGIN
  IF NEW.batch_id IS NULL THEN
    SELECT jsonb_build_object(
      'batch_id', NEW.id,
      'shop_name', NEW.shop_name,
      'shop_address', NEW.shop_address,
      'created_at', NEW.created_at,
      'products', jsonb_build_array(
        jsonb_build_object(
          'name', COALESCE(p.brand || ' ' || p.model, p.name),
          'variants', NEW.variants,
          'quantity', NEW.quantity,
          'price', NEW.price
        )
      )
    ) INTO batch_orders
    FROM products p WHERE p.id = NEW.product_id;
  ELSE
    PERFORM pg_sleep(1);
    
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
  END IF;

  SELECT * INTO http_response FROM http_post(
    function_url,
    batch_orders::text,
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer ' || service_role_key)
    ]
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Email function failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER send_order_email_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_email();

SELECT 'Email function enabled' AS status;
