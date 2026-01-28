# Step-by-Step Guide: Send Email When Order is Canceled

## Prerequisites
- Zapier account (free or paid)
- Access to your Supabase project
- Email service (Gmail, Outlook, or any email provider)

---

## Step 1: Create Zapier Webhook (Do This First!)

### 1.1 Create New Zap

1. Log in to [Zapier](https://zapier.com)
2. Click **Create Zap**
3. Name it: "Order Cancellation Email Notification"

### 1.2 Set Up Webhook Trigger

1. **Choose App & Event:**
   - Search for "Webhooks by Zapier"
   - Select **Catch Hook** as the event
   - Click **Continue**

2. **Set Up Trigger:**
   - Leave "Pick off a Child Key" blank
   - Click **Continue**

3. **Copy Webhook URL:**
   - Zapier will show you a custom webhook URL
   - Example: `https://hooks.zapier.com/hooks/catch/12345678/abcdefg/`
   - **COPY THIS URL** - you'll need it in Step 2
   - Keep this browser tab open

---

## Step 2: Set Up Supabase Database Trigger

### 2.1 Go to Supabase SQL Editor

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### 2.2 Run the SQL Script

Copy and paste this SQL code (replace `YOUR_ZAPIER_WEBHOOK_URL` with the URL from Step 1.3):

```sql
-- COMPLETE SETUP FOR ORDER CANCELLATION WEBHOOK

-- Step 1: Enable the http extension (required for webhooks)
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Step 2: Drop any existing triggers and functions
DROP TRIGGER IF EXISTS order_cancelled_trigger ON orders;
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
DROP TRIGGER IF EXISTS notify_order_status_change ON orders;

DROP FUNCTION IF EXISTS notify_order_cancelled();
DROP FUNCTION IF EXISTS notify_order_status_change();
DROP FUNCTION IF EXISTS handle_order_status_change();

-- Step 3: Create the webhook function
CREATE OR REPLACE FUNCTION notify_order_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Only trigger if is_canceled changed from false to true
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    SELECT extensions.http_post(
      'YOUR_ZAPIER_WEBHOOK_URL', -- Replace with your actual Zapier webhook URL
      json_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'product_id', NEW.product_id,
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name,
        'variants', NEW.variants,
        'is_delivered', NEW.is_delivered,
        'cancelled_at', NOW(),
        'created_at', NEW.created_at
      )::text,
      'application/json'
    ) INTO request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the trigger
CREATE TRIGGER order_cancelled_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_cancelled();

-- Step 5: Verify setup
SELECT 'Setup complete! Trigger created successfully.' AS status;
```

4. Click **Run** to execute the SQL

---

## Step 3: Test the Webhook Connection

### 3.1 Trigger a Test Cancellation

1. Go to your E-Kart application
2. Log in as a user
3. Go to "My Orders"
4. Cancel any order (or create a new order and cancel it)

### 3.2 Verify in Zapier

1. Go back to your Zapier tab
2. Click **Test trigger**
3. You should see the order data appear
4. If successful, click **Continue**

**If no data appears:**
- Wait 30 seconds and try again
- Cancel another order
- Check Supabase logs: Database → Logs

---

## Step 4: Get User Email (Add Lookup Step)

Since the webhook only sends `user_id`, we need to fetch the user's email.

### 4.1 Add Webhooks GET Request

1. Click **+** to add a new action
2. Search for "Webhooks by Zapier"
3. Select **GET** as the action
4. Click **Continue**

### 4.2 Configure the GET Request

**URL:**
```
https://YOUR_PROJECT_ID.supabase.co/rest/v1/user_profiles?id=eq.{{user_id}}&select=email,first_name,last_name,shop_name
```
Replace `YOUR_PROJECT_ID` with your actual Supabase project ID

**Query String Params:** (Leave empty - already in URL)

**Headers:**
Add two headers:

1. **apikey:** `YOUR_SUPABASE_ANON_KEY`
2. **Authorization:** `Bearer YOUR_SUPABASE_ANON_KEY`

(Get your anon key from Supabase: Settings → API → anon public)

**Wrap Response in Array:** No

3. Click **Continue**
4. Click **Test action**
5. You should see the user profile data
6. Click **Continue**

---

## Step 5: Get Product Details (Add Another Lookup)

### 5.1 Add Another Webhooks GET Request

1. Click **+** to add another action
2. Search for "Webhooks by Zapier"
3. Select **GET**
4. Click **Continue**

### 5.2 Configure Product Lookup

**URL:**
```
https://YOUR_PROJECT_ID.supabase.co/rest/v1/products?id=eq.{{product_id}}&select=name,brand,model,price,image
```

**Headers:** (Same as before)
1. **apikey:** `YOUR_SUPABASE_ANON_KEY`
2. **Authorization:** `Bearer YOUR_SUPABASE_ANON_KEY`

3. Click **Continue**
4. Click **Test action**
5. Click **Continue**

---

## Step 6: Set Up Email to User

### 6.1 Add Email Action

1. Click **+** to add action
2. Search for your email provider (e.g., "Gmail")
3. Select **Send Email**
4. Click **Continue**
5. Connect your email account
6. Click **Continue**

### 6.2 Configure User Email

**To:**
```
{{email}} (from Step 4 - User Profile)
```

**Subject:**
```
Your Order Has Been Cancelled - Order #{{order_id}}
```

**Body:**
```
Hello {{first_name}},

Your order has been cancelled successfully.

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{order_id}}
Product: {{name}} (from Step 5)
Quantity: {{quantity}}
Shop: {{shop_name}}
Cancelled At: {{cancelled_at}}

If you have any questions, please contact us.

Best regards,
Agnes Mobiles - B2B Team
```

3. Click **Continue**
4. Click **Test action**
5. Check your email
6. Click **Continue**

---

## Step 7: Set Up Email to Admin

### 7.1 Add Another Email Action

1. Click **+** to add action
2. Search for your email provider
3. Select **Send Email**
4. Click **Continue**

### 7.2 Configure Admin Email

**To:**
```
admin@agnesmobiles.com
```
(Replace with your actual admin email)

**Subject:**
```
Order Cancelled - {{shop_name}} - Order #{{order_id}}
```

**Body:**
```
An order has been cancelled.

Customer Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: {{first_name}} {{last_name}}
Email: {{email}}
Shop: {{shop_name}}

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{order_id}}
Product: {{name}}
Brand: {{brand}}
Model: {{model}}
Quantity: {{quantity}}
Variants: {{variants}}
Order Date: {{created_at}}
Cancelled At: {{cancelled_at}}

View in Admin Panel:
https://your-domain.com/admin/orders

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agnes Mobiles - B2B System
```

3. Click **Continue**
4. Click **Test action**
5. Check admin email
6. Click **Continue**

---

## Step 8: Publish Your Zap

1. Review all steps
2. Click **Publish** or **Turn on Zap**
3. Your Zap is now live! 🎉

---

## Step 9: End-to-End Test

1. Go to your E-Kart app
2. Create a test order
3. Cancel the order
4. Check both user and admin emails
5. Verify all information is correct

---

## Troubleshooting

### Issue: "function net.http_post does not exist"

**Solution:**
1. The http extension needs to be enabled first
2. Run this SQL command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
   ```
3. Then re-run the complete setup script

### Issue: Order cancellation not working at all

**Solution:**
If you want to fix order cancellation WITHOUT Zapier integration, run this SQL:
```sql
-- Remove all webhook triggers
DROP TRIGGER IF EXISTS order_cancelled_trigger ON orders;
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
DROP FUNCTION IF EXISTS notify_order_cancelled();
DROP FUNCTION IF EXISTS notify_order_status_change();
```
This will allow orders to be cancelled normally without sending webhooks.

### Issue: Webhook not receiving data

**Solution:**
1. Check Supabase logs: Database → Logs
2. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'order_cancelled_trigger';
   ```
3. Test manually:
   ```sql
   UPDATE orders SET is_canceled = true WHERE id = 'YOUR_ORDER_ID';
   ```

### Issue: User email not found

**Solution:**
1. Verify the user_profiles table has email field
2. Check the GET request URL is correct
3. Verify API key has read permissions

### Issue: Emails not sending

**Solution:**
1. Check Zapier Task History for errors
2. Verify email account is connected
3. Check spam folder
4. Verify email addresses are correct

### Issue: Missing product details

**Solution:**
1. Verify product_id exists in products table
2. Check GET request headers
3. Ensure API key has read access to products table

---

## Optional Enhancements

### Add Delay Before Sending

1. Add **Delay by Zapier** step after webhook
2. Set delay to 2-5 minutes
3. This allows time to undo accidental cancellations

### Add Conditional Logic

1. Add **Filter by Zapier** step
2. Only send emails if `is_delivered` is false
3. Skip already delivered orders

### Format Variants Nicely

1. Add **Formatter by Zapier** step
2. Choose Text → Replace
3. Convert JSON to readable format

### Add SMS Notification

1. Add **SMS by Zapier** or **Twilio** action
2. Send SMS to admin for immediate notification

---

## Summary

Your Zap flow should look like this:

```
1. Webhooks by Zapier (Catch Hook)
   ↓
2. Webhooks by Zapier (GET - User Profile)
   ↓
3. Webhooks by Zapier (GET - Product Details)
   ↓
4. Gmail/Email (Send to User)
   ↓
5. Gmail/Email (Send to Admin)
```

---

## Important Notes

- Replace all placeholder values with your actual data
- Keep your Supabase API keys secure
- Test thoroughly before going live
- Monitor Zapier task history for errors
- Free Zapier accounts have task limits (100 tasks/month)

---

## Alternative: Supabase Edge Functions

If you prefer not to use Zapier, you can create a Supabase Edge Function that sends emails directly using services like:
- Resend
- SendGrid
- AWS SES
- Mailgun

This keeps everything within your infrastructure but requires more coding.
