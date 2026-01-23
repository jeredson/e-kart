-- Add batch_id column to orders table to group cart checkouts
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_batch_id ON orders(batch_id);

-- Update the webhook function to only send email for the last item in a batch
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE'; -- Replace with your webhook URL
  http_response http_response;
  batch_orders RECORD;
  orders_json JSONB;
  total_amount NUMERIC := 0;
BEGIN
  -- If no batch_id, send individual order (for Buy Now)
  IF NEW.batch_id IS NULL THEN
    -- Fetch product details
    SELECT name, brand, model INTO product_data
    FROM products
    WHERE id = NEW.product_id;
    
    -- Format variants
    SELECT string_agg(key || ': ' || value, ', ')
    INTO variant_text
    FROM jsonb_each_text(NEW.variants);
    
    -- Send webhook for single order
    SELECT * INTO http_response FROM http_post(
      webhook_url,
      jsonb_build_object(
        'order_type', 'single',
        'order_id', NEW.id,
        'brand', COALESCE(product_data.brand, 'N/A'),
        'model', COALESCE(product_data.model, product_data.name, 'N/A'),
        'product_name', product_data.name,
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
  ELSE
    -- For batch orders, only send email when all orders in batch are inserted
    -- Check if this is the last order by comparing timestamps
    PERFORM pg_sleep(0.5); -- Small delay to ensure all batch inserts complete
    
    -- Build array of all orders in this batch
    SELECT jsonb_agg(
      jsonb_build_object(
        'order_id', o.id,
        'product_name', p.name,
        'brand', COALESCE(p.brand, 'N/A'),
        'model', COALESCE(p.model, p.name, 'N/A'),
        'variants', (
          SELECT string_agg(key || ': ' || value, ', ')
          FROM jsonb_each_text(o.variants)
        ),
        'quantity', o.quantity,
        'price', COALESCE(o.price, 0),
        'subtotal', COALESCE(o.quantity * o.price, 0)
      )
    )
    INTO orders_json
    FROM orders o
    JOIN products p ON p.id = o.product_id
    WHERE o.batch_id = NEW.batch_id;
    
    -- Calculate total
    SELECT SUM(quantity * COALESCE(price, 0))
    INTO total_amount
    FROM orders
    WHERE batch_id = NEW.batch_id;
    
    -- Send single webhook with all orders
    SELECT * INTO http_response FROM http_post(
      webhook_url,
      jsonb_build_object(
        'order_type', 'batch',
        'batch_id', NEW.batch_id,
        'orders', orders_json,
        'total_amount', COALESCE(total_amount, 0),
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'created_at', NEW.created_at
      )::text,
      'application/json'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the order
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
