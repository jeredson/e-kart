-- Update webhook trigger to include price field
-- Run this in Supabase SQL Editor

-- Drop and recreate the function with price field
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;

CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/uq6xigu/';
  http_response http_response;
BEGIN
  RAISE NOTICE 'Order webhook trigger fired for order: %', NEW.id;
  
  -- Fetch product details
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = NEW.product_id;
  
  RAISE NOTICE 'Product data: %, %, %', product_data.name, product_data.brand, product_data.model;
  
  -- Format variants
  SELECT string_agg(key || ': ' || value, ', ')
  INTO variant_text
  FROM jsonb_each_text(NEW.variants);
  
  RAISE NOTICE 'Variants: %', variant_text;
  RAISE NOTICE 'Price: %', NEW.price;
  RAISE NOTICE 'Webhook URL: %', webhook_url;
  
  -- Send webhook with price field
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
        'price', NEW.price,
        'subtotal', NEW.quantity * NEW.price,
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'created_at', NEW.created_at
      )::text,
      'application/json'
    );
    
    RAISE NOTICE 'Webhook response status: %', http_response.status;
    RAISE NOTICE 'Webhook response: %', http_response.content;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Webhook failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();

-- Verify
SELECT 'Webhook trigger updated with price field!' as status;
