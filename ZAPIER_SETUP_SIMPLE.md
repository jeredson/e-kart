# Zapier Email Notifications - Order Cancellation

## Simple 3-Step Setup

---

## STEP 1: Create Zapier Webhook (5 minutes)

### 1.1 Create New Zap
1. Go to [zapier.com](https://zapier.com) and log in
2. Click **Create Zap**
3. Name it: "Order Cancellation Emails"

### 1.2 Set Up Trigger
1. Search for **"Webhooks by Zapier"**
2. Choose **"Catch Hook"**
3. Click **Continue**
4. **COPY THE WEBHOOK URL** (looks like: `https://hooks.zapier.com/hooks/catch/26132431/uqvqkun/`)
5. Keep this tab open - we'll test it later

---

## STEP 2: Set Up Supabase (2 minutes)

### 2.1 Enable HTTP Extension
Go to Supabase SQL Editor and run:

```sql
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
```

### 2.2 Create the Trigger
Copy this SQL and **replace `https://hooks.zapier.com/hooks/catch/26132431/uqvqkun/`** with the URL from Step 1.2:

```sql
-- Remove old triggers first
DROP TRIGGER IF EXISTS order_cancel_webhook ON orders;
DROP FUNCTION IF EXISTS send_cancel_webhook() CASCADE;

-- Create webhook function
CREATE OR REPLACE FUNCTION send_cancel_webhook()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Only when order is cancelled
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    SELECT extensions.http_post(
      'YOUR_WEBHOOK_URL',  -- REPLACE THIS WITH YOUR ZAPIER WEBHOOK URL
      json_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'product_id', NEW.product_id,
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name,
        'created_at', NEW.created_at
      )::text,
      'application/json'
    ) INTO request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER order_cancel_webhook
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_cancel_webhook();
```

### 2.3 Test the Connection
1. Go to your E-Kart app
2. Cancel any order
3. Go back to Zapier
4. Click **Test trigger**
5. You should see the order data appear
6. Click **Continue**

---

## STEP 3: Set Up Emails in Zapier (10 minutes)

### 3.1 Get User Email

1. Click **+** to add action
2. Search **"Webhooks by Zapier"**
3. Choose **GET**
4. Click **Continue**

**Configure:**
- **URL:** `https://YOUR_PROJECT.supabase.co/rest/v1/user_profiles?id=eq.{{user_id}}&select=email,first_name,last_name,shop_name`
  - Replace `YOUR_PROJECT` with your Supabase project ID
- **Headers:**
  - `apikey`: Your Supabase anon key
  - `Authorization`: `Bearer YOUR_SUPABASE_ANON_KEY`

5. Click **Continue**
6. Click **Test action**
7. Click **Continue**

### 3.2 Get Product Details

1. Click **+** to add action
2. Search **"Webhooks by Zapier"**
3. Choose **GET**
4. Click **Continue**

**Configure:**
- **URL:** `https://YOUR_PROJECT.supabase.co/rest/v1/products?id=eq.{{product_id}}&select=name,brand,model`
- **Headers:** (same as above)
  - `apikey`: Your Supabase anon key
  - `Authorization`: `Bearer YOUR_SUPABASE_ANON_KEY`

5. Click **Continue**
6. Click **Test action**
7. Click **Continue**

### 3.3 Send Email to Customer

1. Click **+** to add action
2. Search for **"Gmail"** (or your email provider)
3. Choose **"Send Email"**
4. Click **Continue**
5. Connect your Gmail account
6. Click **Continue**

**Configure Email:**
- **To:** `{{email}}` (from Step 3.1)
- **Subject:** `Order Cancelled - Agnes Mobiles`
- **Body:**
```
Hello {{first_name}},

Your order has been cancelled successfully.

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{order_id}}
Product: {{brand}} {{model}}
Quantity: {{quantity}}
Shop: {{shop_name}}

If you have any questions, please contact us.

Best regards,
Agnes Mobiles - B2B Team
```

7. Click **Continue**
8. Click **Test action**
9. Check your email!
10. Click **Continue**

### 3.4 Send Email to Admin

1. Click **+** to add action
2. Search for **"Gmail"**
3. Choose **"Send Email"**
4. Click **Continue**

**Configure Email:**
- **To:** `your-admin-email@gmail.com` (your actual admin email)
- **Subject:** `Order Cancelled - {{shop_name}}`
- **Body:**
```
An order has been cancelled.

Customer Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: {{first_name}} {{last_name}}
Email: {{email}}
Shop: {{shop_name}}

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{order_id}}
Product: {{brand}} {{model}}
Quantity: {{quantity}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agnes Mobiles - B2B System
```

5. Click **Continue**
6. Click **Test action**
7. Check admin email!
8. Click **Continue**

---

## STEP 4: Publish & Test

### 4.1 Publish Zap
1. Review all steps
2. Click **Publish**
3. Turn on the Zap

### 4.2 End-to-End Test
1. Go to your E-Kart app
2. Create a test order
3. Cancel the order
4. Wait 30 seconds
5. Check both customer and admin emails
6. ✅ Done!

---

## Troubleshooting

### ❌ "Order cancellation not working"
**Solution:** Run this SQL to remove all triggers:
```sql
DROP TRIGGER IF EXISTS order_cancel_webhook ON orders;
DROP FUNCTION IF EXISTS send_cancel_webhook() CASCADE;
```
Then start over from Step 2.

### ❌ "Zapier not receiving data"
**Solution:**
1. Check Supabase logs: Database → Logs
2. Make sure you replaced `YOUR_WEBHOOK_URL` in the SQL
3. Try cancelling another order

### ❌ "User email not found"
**Solution:**
1. Verify the user_profiles table has an `email` column
2. Check your Supabase anon key is correct
3. Make sure the URL has your correct project ID

### ❌ "Emails not sending"
**Solution:**
1. Check Zapier Task History for errors
2. Verify Gmail account is connected
3. Check spam folder
4. Make sure all {{variables}} are mapped correctly

---

## Quick Reference

### Your Zapier Flow Should Look Like:
```
1. Webhooks by Zapier (Catch Hook)
   ↓
2. Webhooks by Zapier (GET - User Profile)
   ↓
3. Webhooks by Zapier (GET - Product Details)
   ↓
4. Gmail (Send to Customer)
   ↓
5. Gmail (Send to Admin)
```

### Important URLs:
- Zapier Dashboard: https://zapier.com/app/zaps
- Supabase Dashboard: https://supabase.com/dashboard
- Your Supabase Project: https://YOUR_PROJECT.supabase.co

### Free Tier Limits:
- Zapier Free: 100 tasks/month
- Gmail: 500 emails/day

---

## Need Help?

If you get stuck:
1. Check Zapier Task History for error messages
2. Check Supabase Database Logs
3. Make sure order cancellation works first (without emails)
4. Test each Zapier step individually

---

## Summary

✅ **What you did:**
1. Created a Zapier webhook to catch order cancellations
2. Set up Supabase to send data to Zapier when orders are cancelled
3. Configured Zapier to fetch user and product details
4. Set up automatic emails to customer and admin

✅ **What happens now:**
- When any order is cancelled → Zapier receives notification
- Zapier fetches user email and product details
- Customer receives cancellation email
- Admin receives notification email

🎉 **You're done!**
