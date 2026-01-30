-- Order cancel email notification (Supabase Edge Function + Resend)
-- This trigger runs only on UPDATE when is_canceled becomes true.
-- It does NOT affect your existing "new order" email (which uses INSERT).

CREATE EXTENSION IF NOT EXISTS pg_net;

DROP TRIGGER IF EXISTS send_order_cancel_notification_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_cancel_notification() CASCADE;

CREATE OR REPLACE FUNCTION send_order_cancel_notification()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-order-cancel-notification';
  service_role_key TEXT := 'YOUR_SERVICE_ROLE_KEY';
BEGIN
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER send_order_cancel_notification_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_cancel_notification();
