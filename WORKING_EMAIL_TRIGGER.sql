-- WORKING EMAIL TRIGGER WITH PG_NET
-- Run this in Supabase Dashboard → SQL Editor

-- Drop old triggers
DROP TRIGGER IF EXISTS send_order_email_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_email() CASCADE;

-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function
CREATE OR REPLACE FUNCTION send_order_email()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT := 'https://aqcmmfeimioxvcpwpafr.supabase.co/functions/v1/send-order-email';
  service_role_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxY21tZmVpbWlveHZjcHdwYWZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxODM3OSwiZXhwIjoyMDgzNTk0Mzc5fQ.r-FOYCZy3RPLnCxfP6QOPOxs3eLNvCUsaVmga3dWQqc';
  batch_orders JSONB;
  is_first_in_batch BOOLEAN;
BEGIN
  -- For single product (Buy Now)
  IF NEW.batch_id IS NULL THEN
    SELECT jsonb_build_object(
      'batch_id', NEW.id::text,
      'shop_name', NEW.shop_name,
      'shop_address', NEW.shop_address,
      'created_at', NEW.created_at::text,
      'products', jsonb_build_array(
        jsonb_build_object(
          'name', COALESCE(p.brand || ' ' || p.model, p.name),
          'variants', NEW.variants,
          'quantity', NEW.quantity,
          'price', NEW.price
        )
      )
    ) INTO batch_orders
    FROM products p WHERE p.id = NEW.product_id;
    
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := batch_orders
    );
    
  -- For batch orders (Checkout) - only send once
  ELSE
    -- Check if this is the first order in the batch
    SELECT COUNT(*) = 1 INTO is_first_in_batch
    FROM orders WHERE batch_id = NEW.batch_id;
    
    IF is_first_in_batch THEN
      PERFORM pg_sleep(2);
      
      SELECT jsonb_build_object(
        'batch_id', NEW.batch_id::text,
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'created_at', NEW.created_at::text,
        'products', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'name', COALESCE(p.brand || ' ' || p.model, p.name),
              'variants', o.variants,
              'quantity', o.quantity,
              'price', o.price
            )
          )
          FROM orders o
          JOIN products p ON p.id = o.product_id
          WHERE o.batch_id = NEW.batch_id
        )
      ) INTO batch_orders;
      
      PERFORM net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := batch_orders
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER send_order_email_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_email();

-- Verify trigger is enabled
SELECT 
    tgname as trigger_name,
    CASE tgenabled
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
    END as status
FROM pg_trigger 
WHERE tgname = 'send_order_email_trigger';
