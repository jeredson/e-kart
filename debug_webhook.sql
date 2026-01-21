-- Debug and fix webhook email notifications

-- Step 1: Check if http extension is enabled
SELECT * FROM pg_extension WHERE extname = 'http';

-- Step 2: Check if trigger exists
SELECT tgname, tgtype, tgenabled FROM pg_trigger WHERE tgname = 'on_order_webhook';

-- Step 3: Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'send_order_webhook';

-- Step 4: Test the webhook manually (replace order_id with a real order ID)
DO $$
DECLARE
  test_order RECORD;
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE'; -- Replace with your Zapier URL
  http_response http_response;
BEGIN
  -- Get the latest order
  SELECT * INTO test_order FROM orders ORDER BY created_at DESC LIMIT 1;
  
  -- Get product details
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = test_order.product_id;
  
  -- Format variants
  SELECT string_agg(key || ': ' || value, ', ')
  INTO variant_text
  FROM jsonb_each_text(test_order.variants);
  
  -- Send test webhook
  SELECT * INTO http_response FROM http_post(
    webhook_url,
    jsonb_build_object(
      'order_id', test_order.id,
      'brand', COALESCE(product_data.brand, 'N/A'),
      'model', COALESCE(product_data.model, product_data.name, 'N/A'),
      'product_name', product_data.name,
      'variants', COALESCE(variant_text, 'None'),
      'quantity', test_order.quantity,
      'shop_name', test_order.shop_name,
      'shop_address', test_order.shop_address,
      'created_at', test_order.created_at
    )::text,
    'application/json'
  );
  
  RAISE NOTICE 'Webhook response status: %', http_response.status;
  RAISE NOTICE 'Webhook response: %', http_response.content;
END $$;

-- Step 5: Check recent orders to see if trigger fired
SELECT id, created_at, product_id, shop_name FROM orders ORDER BY created_at DESC LIMIT 5;
