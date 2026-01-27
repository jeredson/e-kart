-- Simpler approach: Send webhook for each order but include batch info
-- Zapier can then group them by batch_id using Delay and Digest

CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/uq6xigu/';
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
  
  -- Send webhook with batch info
  SELECT * INTO http_response FROM http_post(
    webhook_url,
    jsonb_build_object(
      'order_type', CASE WHEN NEW.batch_id IS NULL THEN 'single' ELSE 'batch' END,
      'batch_id', COALESCE(NEW.batch_id::text, 'none'),
      'order_id', NEW.id,
      'product_name', product_data.name,
      'brand', COALESCE(product_data.brand, 'N/A'),
      'model', COALESCE(product_data.model, product_data.name, 'N/A'),
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
    RAISE WARNING 'Webhook failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();
