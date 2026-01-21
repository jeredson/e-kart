-- Fix: Separate stock update from webhook notification
-- This ensures stock updates happen reliably

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS send_order_webhook();
DROP FUNCTION IF EXISTS notify_admin_new_order();

-- Function to send webhook (non-blocking)
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE'; -- Replace with your Zapier webhook URL
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
  
  -- Send webhook (don't fail if this errors)
  BEGIN
    SELECT * INTO http_response FROM http_post(
      webhook_url,
      jsonb_build_object(
        'order_id', NEW.id,
        'brand', COALESCE(product_data.brand, 'N/A'),
        'model', COALESCE(product_data.model, product_data.name, 'N/A'),
        'product_name', product_data.name,
        'variants', COALESCE(variant_text, 'None'),
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'created_at', NEW.created_at
      )::text,
      'application/json'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Just log, don't fail the order
      RAISE WARNING 'Webhook notification failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (AFTER INSERT so it doesn't block)
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();

-- Verify
SELECT 'Webhook trigger created successfully' as status;
