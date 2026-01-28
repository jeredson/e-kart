-- Create a function to send webhook when order is canceled
CREATE OR REPLACE FUNCTION notify_order_cancelled()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if is_canceled changed from false to true
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    PERFORM net.http_post(
      url := 'YOUR_ZAPIER_WEBHOOK_URL', -- Replace with your Zapier webhook URL
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'product_id', NEW.product_id,
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name,
        'variants', NEW.variants,
        'is_delivered', NEW.is_delivered,
        'cancelled_at', NOW(),
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS order_cancelled_trigger ON orders;

-- Create trigger on orders table
CREATE TRIGGER order_cancelled_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_cancelled();
