-- Simple Zapier Webhook Setup for Order Notifications
-- Handles both Buy Now (single) and Checkout (batch) orders

-- Step 1: Clean up existing triggers
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS notify_admin_new_order() CASCADE;

-- Step 2: Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Step 3: Create webhook function
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_ZAPIER_WEBHOOK_URL'; -- Replace with your Zapier webhook URL
BEGIN
  -- Get product details
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = NEW.product_id;
  
  -- Format variants (e.g., "Color: Blue, Ram: 8GB, Storage: 128GB")
  SELECT string_agg(key || ': ' || value, ', ' ORDER BY key)
  INTO variant_text
  FROM jsonb_each_text(NEW.variants);
  
  -- Send to Zapier (wrapped in exception so order creation never fails)
  BEGIN
    PERFORM http_post(
      webhook_url,
      jsonb_build_object(
        'order_id', NEW.id,
        'batch_id', NEW.batch_id,
        'product_name', product_data.name,
        'brand', COALESCE(product_data.brand, 'N/A'),
        'model', COALESCE(product_data.model, 'N/A'),
        'variants', COALESCE(variant_text, 'None'),
        'quantity', NEW.quantity,
        'unit_price', COALESCE(NEW.price, 0),
        'subtotal', COALESCE(NEW.quantity * NEW.price, 0),
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'order_date', TO_CHAR(NEW.created_at, 'DD/MM/YYYY')
      )::text,
      'application/json'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Zapier webhook failed for order %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();

-- Verify setup
SELECT 'Webhook trigger created successfully!' as status;
