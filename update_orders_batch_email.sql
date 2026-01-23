-- Add batch_id column to orders table to group cart checkouts
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_batch_id ON orders(batch_id);

-- Create a table to track processed batches
CREATE TABLE IF NOT EXISTS processed_batches (
  batch_id UUID PRIMARY KEY,
  processed_at TIMESTAMP DEFAULT NOW()
);

-- Update the webhook function to only send email once per batch
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE'; -- Replace with your webhook URL
  http_response http_response;
  orders_json JSONB;
  total_amount NUMERIC := 0;
  batch_processed BOOLEAN;
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
    -- For batch orders, add a delay and check if this is likely the last insert
    PERFORM pg_sleep(1); -- Wait for all inserts to complete
    
    -- Try to mark batch as processed (only first one succeeds)
    BEGIN
      INSERT INTO processed_batches (batch_id) VALUES (NEW.batch_id);
      
      -- If we reach here, we successfully inserted, so we should send the email
      -- Calculate total
      SELECT SUM(quantity * COALESCE(price, 0))
      INTO total_amount
      FROM orders
      WHERE batch_id = NEW.batch_id;
      
      -- Send single webhook with formatted order details
      SELECT * INTO http_response FROM http_post(
        webhook_url,
        jsonb_build_object(
          'order_type', 'batch',
          'batch_id', NEW.batch_id,
          'order_count', (SELECT COUNT(*) FROM orders WHERE batch_id = NEW.batch_id),
          'order_details', (
            SELECT string_agg(
              'Product: ' || p.name || E'\n' ||
              'Brand: ' || COALESCE(p.brand, 'N/A') || E'\n' ||
              'Model: ' || COALESCE(p.model, 'N/A') || E'\n' ||
              'Variants: ' || COALESCE((
                SELECT string_agg(key || ': ' || value, ', ')
                FROM jsonb_each_text(o.variants)
              ), 'None') || E'\n' ||
              'Quantity: ' || o.quantity || E'\n' ||
              'Price: Rs.' || COALESCE(o.price, 0) || E'\n' ||
              'Subtotal: Rs.' || COALESCE(o.quantity * o.price, 0),
              E'\n\n---\n\n'
            )
            FROM orders o
            JOIN products p ON p.id = o.product_id
            WHERE o.batch_id = NEW.batch_id
            ORDER BY o.created_at
          ),
          'total_amount', COALESCE(total_amount, 0),
          'shop_name', NEW.shop_name,
          'shop_address', NEW.shop_address,
          'created_at', NEW.created_at
        )::text,
        'application/json'
      );
    EXCEPTION
      WHEN unique_violation THEN
        -- Batch already processed by another trigger, skip
        NULL;
    END;
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

-- Optional: Clean up old processed batches (run periodically)
-- DELETE FROM processed_batches WHERE processed_at < NOW() - INTERVAL '7 days';
