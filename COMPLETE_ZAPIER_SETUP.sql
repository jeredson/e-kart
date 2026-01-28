-- COMPLETE SETUP: Zapier Email Notifications
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Ensure orders table has all columns
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;

-- ============================================
-- STEP 2: Clean up old triggers
-- ============================================
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS send_order_webhook() CASCADE;
DROP FUNCTION IF EXISTS notify_admin_new_order() CASCADE;

-- ============================================
-- STEP 3: Enable http extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS http;

-- ============================================
-- STEP 4: Create webhook function
-- ============================================
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_ZAPIER_WEBHOOK_URL'; -- ⚠️ REPLACE THIS
BEGIN
  -- Get product details
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = NEW.product_id;
  
  -- Format variants
  SELECT string_agg(key || ': ' || value, ', ' ORDER BY key)
  INTO variant_text
  FROM jsonb_each_text(NEW.variants);
  
  -- Send to Zapier
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
      RAISE WARNING 'Zapier webhook failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 5: Create trigger
-- ============================================
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  '✅ Setup complete!' as status,
  'Next: Replace YOUR_ZAPIER_WEBHOOK_URL with your actual webhook URL' as next_step;

-- Check trigger
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_order_webhook';

-- Check extension
SELECT extname FROM pg_extension WHERE extname = 'http';
