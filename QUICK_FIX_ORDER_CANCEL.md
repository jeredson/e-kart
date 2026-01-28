# Quick Fix: Order Cancellation Error

## Problem
Error when canceling orders: `function net.http_post does not exist`

## Solution Options

### Option 1: Fix Cancellation WITHOUT Zapier (Recommended First)

Run this SQL in Supabase SQL Editor:

```sql
-- Remove all webhook triggers
DROP TRIGGER IF EXISTS order_cancelled_trigger ON orders;
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
DROP TRIGGER IF EXISTS notify_order_status_change ON orders;

DROP FUNCTION IF EXISTS notify_order_cancelled();
DROP FUNCTION IF EXISTS notify_order_status_change();
DROP FUNCTION IF EXISTS handle_order_status_change();
```

✅ Order cancellation will work immediately
❌ No email notifications

---

### Option 2: Fix Cancellation WITH Zapier

1. **First, get your Zapier webhook URL:**
   - Go to Zapier.com
   - Create a new Zap
   - Choose "Webhooks by Zapier" → "Catch Hook"
   - Copy the webhook URL

2. **Then run this SQL in Supabase:**

```sql
-- Enable http extension
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Remove old triggers
DROP TRIGGER IF EXISTS order_cancelled_trigger ON orders;
DROP FUNCTION IF EXISTS notify_order_cancelled();

-- Create new function
CREATE OR REPLACE FUNCTION notify_order_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    SELECT extensions.http_post(
      'YOUR_ZAPIER_WEBHOOK_URL_HERE',
      json_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'product_id', NEW.product_id,
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name
      )::text,
      'application/json'
    ) INTO request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER order_cancelled_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_cancelled();
```

3. **Replace `YOUR_ZAPIER_WEBHOOK_URL_HERE`** with your actual webhook URL

✅ Order cancellation works
✅ Email notifications via Zapier

---

## Which Option Should I Choose?

**Choose Option 1 if:**
- You want to fix the issue immediately
- You don't need email notifications right now
- You can set up Zapier later

**Choose Option 2 if:**
- You need email notifications
- You have time to set up Zapier
- You have a Zapier account

---

## Test After Fix

1. Go to your E-Kart app
2. Create a test order
3. Try to cancel it
4. Should work without errors!

---

## Files Reference

- `remove_webhook_triggers.sql` - Option 1 (no Zapier)
- `complete_webhook_setup.sql` - Option 2 (with Zapier)
- `ZAPIER_ORDER_CANCEL_EMAIL_GUIDE.md` - Full Zapier setup guide
