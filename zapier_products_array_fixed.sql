-- Zapier Webhook - Products Array Format
-- Sends ONE webhook per order/batch with ALL products in array

-- Step 1: Clean up existing triggers
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP TRIGGER IF EXISTS send_batch_webhook_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS notify_admin_new_order() CASCADE;
DROP FUNCTION IF EXISTS send_batch_webhook() CASCADE;

-- Step 2: Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Step 3: Create webhook function that aggregates products
CREATE OR REPLACE FUNCTION send_batch_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/uqvigh0/';
  products_array JSONB;
  total_amount NUMERIC := 0;
  is_first_in_batch BOOLEAN;
BEGIN
  -- Check if this is the first order in batch
  IF NEW.batch_id IS NOT NULL THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM orders 
      WHERE batch_id = NEW.batch_id 
      AND id < NEW.id
    ) INTO is_first_in_batch;
    
    IF NOT is_first_in_batch THEN
      RETURN NEW;
    END IF;
    
    -- Wait for all batch inserts to complete
    PERFORM pg_sleep(0.5);
  END IF;
  
  -- Build products array
  SELECT 
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'product_name', p.name,
        'brand', COALESCE(p.brand, 'N/A'),
        'model', COALESCE(p.model, 'N/A'),
        'variants', (
          SELECT string_agg(key || ': ' || value, ', ' ORDER BY key)
          FROM jsonb_each_text(o.variants)
        ),
        'quantity', o.quantity,
        'unit_price', COALESCE(o.price, 0),
        'subtotal', COALESCE(o.quantity * o.price, 0)
      )
    ), '[]'::jsonb)
  INTO products_array
  FROM orders o
  JOIN products p ON o.product_id = p.id
  WHERE (NEW.batch_id IS NOT NULL AND o.batch_id = NEW.batch_id)
     OR (NEW.batch_id IS NULL AND o.id = NEW.id);
  
  -- Calculate total
  SELECT COALESCE(SUM(quantity * price), 0)
  INTO total_amount
  FROM orders
  WHERE (NEW.batch_id IS NOT NULL AND batch_id = NEW.batch_id)
     OR (NEW.batch_id IS NULL AND id = NEW.id);
  
  -- Send to Zapier
  BEGIN
    PERFORM http_post(
      webhook_url,
      jsonb_build_object(
        'batch_id', NEW.batch_id,
        'order_id', NEW.id,
        'products', products_array,
        'total_amount', total_amount,
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'order_date', TO_CHAR(NEW.created_at, 'DD/MM/YYYY')
      )::text,
      'application/json'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Zapier webhook failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger
CREATE TRIGGER send_batch_webhook_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_batch_webhook();

-- Verify setup
SELECT 'Webhook trigger created successfully!' as status;
