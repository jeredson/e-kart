-- BATCH WEBHOOK: Send ONE request per batch with ALL products

DROP TRIGGER IF EXISTS order_notification_trigger ON orders;
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS batch_to_zapier_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_notification() CASCADE;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS send_batch_to_zapier() CASCADE;

CREATE EXTENSION IF NOT EXISTS http;

CREATE OR REPLACE FUNCTION send_batch_to_zapier()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/ulyfcdm/';
  batch_data JSONB;
  http_response http_response;
BEGIN
  SELECT jsonb_build_object(
    'batch_id', NEW.id,
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
      WHERE o.id = NEW.id
    )
  ) INTO batch_data;

  SELECT * INTO http_response FROM http_post(
    webhook_url,
    batch_data::text,
    'application/json'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Webhook failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER batch_to_zapier_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_batch_to_zapier();

SELECT 'Batch webhook enabled' AS status;
