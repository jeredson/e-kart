# Zapier Email Notifications - WORKING VERSION

## 🔴 RUN THIS SQL FIRST

### Step 1: Enable HTTP Extension
```sql
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
```

### Step 2: Verify Extension Installed
```sql
SELECT * FROM pg_extension WHERE extname = 'http';
```
You should see "http" in the results.

### Step 3: Remove Old Triggers
```sql
DROP TRIGGER IF EXISTS order_cancel_webhook ON orders;
DROP FUNCTION IF EXISTS send_cancel_webhook() CASCADE;
```

### Step 4: Create Webhook Function
**REPLACE `YOUR_ZAPIER_WEBHOOK_URL` with your actual Zapier webhook URL**

```sql
CREATE OR REPLACE FUNCTION send_cancel_webhook()
RETURNS TRIGGER AS $$
DECLARE
  http_response record;
BEGIN
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    
    SELECT * FROM extensions.http_post(
      url := 'YOUR_ZAPIER_WEBHOOK_URL',
      body := json_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'product_id', NEW.product_id,
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name
      )::text,
      headers := '{"Content-Type": "application/json"}'::jsonb
    ) INTO http_response;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 5: Create Trigger
```sql
CREATE TRIGGER order_cancel_webhook
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_cancel_webhook();
```

### Step 6: Test
Cancel an order and check if Zapier receives the data.

---

## Full Zapier Setup

1. **Create Zap** → Webhooks by Zapier → Catch Hook → Get webhook URL
2. **Run SQL above** with your webhook URL
3. **Add Zapier Actions:**
   - GET user email from Supabase
   - GET product details from Supabase  
   - Send email to customer
   - Send email to admin
4. **Publish Zap**

See `ZAPIER_SETUP_SIMPLE.md` for detailed Zapier configuration steps.

---

## If HTTP Extension Doesn't Work

Some Supabase projects don't have the http extension. If you get errors, remove the trigger:

```sql
DROP TRIGGER IF EXISTS order_cancel_webhook ON orders;
DROP FUNCTION IF EXISTS send_cancel_webhook() CASCADE;
```

Then use the React app method instead (contact me for instructions).
