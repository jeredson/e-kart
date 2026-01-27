-- Solution: Use a statement-level trigger instead of row-level
-- This fires ONCE after all rows are inserted

-- First, drop the existing row-level trigger
DROP TRIGGER IF EXISTS on_order_webhook ON orders;

-- Create a function that processes all new orders at once
CREATE OR REPLACE FUNCTION send_batch_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26132431/uq6xigu/';
  http_response http_response;
  batch_id_val UUID;
  order_details TEXT;
  total_amount NUMERIC;
  shop_name_val TEXT;
  shop_address_val TEXT;
  created_at_val TIMESTAMP;
BEGIN
  -- Get distinct batch_ids from new orders (excluding NULL for Buy Now)
  FOR batch_id_val IN 
    SELECT DISTINCT batch_id 
    FROM new_orders 
    WHERE batch_id IS NOT NULL
  LOOP
    -- Build formatted order details for this batch
    SELECT 
      string_agg(
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
      ),
      SUM(o.quantity * COALESCE(o.price, 0)),
      MAX(o.shop_name),
      MAX(o.shop_address),
      MAX(o.created_at)
    INTO order_details, total_amount, shop_name_val, shop_address_val, created_at_val
    FROM new_orders o
    JOIN products p ON p.id = o.product_id
    WHERE o.batch_id = batch_id_val;
    
    -- Send webhook for this batch
    SELECT * INTO http_response FROM http_post(
      webhook_url,
      jsonb_build_object(
        'order_type', 'batch',
        'batch_id', batch_id_val,
        'order_details', order_details,
        'total_amount', COALESCE(total_amount, 0),
        'shop_name', shop_name_val,
        'shop_address', shop_address_val,
        'created_at', created_at_val
      )::text,
      'application/json'
    );
  END LOOP;
  
  -- Handle individual Buy Now orders (batch_id IS NULL)
  FOR order_details IN
    SELECT o.id
    FROM new_orders o
    WHERE o.batch_id IS NULL
  LOOP
    DECLARE
      order_rec RECORD;
      product_data RECORD;
      variant_text TEXT;
    BEGIN
      SELECT * INTO order_rec FROM new_orders WHERE id = order_details;
      
      SELECT name, brand, model INTO product_data
      FROM products WHERE id = order_rec.product_id;
      
      SELECT string_agg(key || ': ' || value, ', ')
      INTO variant_text
      FROM jsonb_each_text(order_rec.variants);
      
      SELECT * INTO http_response FROM http_post(
        webhook_url,
        jsonb_build_object(
          'order_type', 'single',
          'order_id', order_rec.id,
          'product_name', product_data.name,
          'brand', COALESCE(product_data.brand, 'N/A'),
          'model', COALESCE(product_data.model, product_data.name, 'N/A'),
          'variants', COALESCE(variant_text, 'None'),
          'quantity', order_rec.quantity,
          'price', COALESCE(order_rec.price, 0),
          'subtotal', COALESCE(order_rec.quantity * order_rec.price, 0),
          'shop_name', order_rec.shop_name,
          'shop_address', order_rec.shop_address,
          'created_at', order_rec.created_at
        )::text,
        'application/json'
      );
    END;
  END LOOP;
  
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Webhook failed: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a statement-level trigger (fires once per INSERT statement)
CREATE TRIGGER on_order_batch_webhook
  AFTER INSERT ON orders
  REFERENCING NEW TABLE AS new_orders
  FOR EACH STATEMENT
  EXECUTE FUNCTION send_batch_order_webhook();
