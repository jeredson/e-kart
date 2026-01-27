# Fix Email Notifications for Buy Now Orders

## Problem
You're not receiving emails when customers place orders through the "Buy Now" page.

## Root Causes
1. The webhook trigger may not be properly configured
2. The webhook URL might be missing or incorrect
3. The email service (Zapier/Resend) might not be set up
4. Database extensions might not be enabled

## Solution Options

### Option 1: Zapier Webhook (Recommended - Easiest)

#### Step 1: Set Up Zapier
1. Go to [Zapier](https://zapier.com) and create a free account
2. Click "Create Zap"
3. For Trigger:
   - Choose "Webhooks by Zapier"
   - Select "Catch Hook"
   - Copy the webhook URL (e.g., `https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/`)

#### Step 2: Configure Database Trigger
1. Open your Supabase SQL Editor
2. Run the diagnostic script first: `diagnose_email_issue.sql`
3. Run the fix script: `fix_email_notifications.sql`
4. **IMPORTANT**: Replace `YOUR_WEBHOOK_URL_HERE` with your actual Zapier webhook URL

```sql
-- Find this line in the function:
webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE';

-- Replace with:
webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/';
```

#### Step 3: Complete Zapier Setup
1. Place a test order in your app
2. Go back to Zapier - it should have caught the webhook
3. Add an action: "Gmail" or "Email by Zapier"
4. Configure the email:
   - **To**: Your admin email
   - **Subject**: `New Order: {{brand}} {{model}}`
   - **Body**: Use the template below

#### Email Template for Zapier:
```
New Order Received!

Product Details:
- Brand: {{brand}}
- Model: {{model}}
- Product: {{product_name}}
- Variants: {{variants}}
- Quantity: {{quantity}}
- Price per unit: ₹{{price}}
- Subtotal: ₹{{subtotal}}

Shop Details:
- Shop Name: {{shop_name}}
- Shop Address: {{shop_address}}

Order Info:
- Order ID: {{order_id}}
- Date: {{created_at}}
```

5. Test the Zap
6. Turn it ON

---

### Option 2: Supabase Edge Function + Resend (More Technical)

#### Step 1: Set Up Resend
1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Verify your domain (or use test domain)

#### Step 2: Configure Supabase
1. Install Supabase CLI: `npm install -g supabase`
2. Link project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Set secrets:
```bash
supabase secrets set RESEND_API_KEY=your_api_key
supabase secrets set ADMIN_EMAIL=your_admin_email
```

#### Step 3: Deploy Edge Function
```bash
supabase functions deploy send-order-notification
```

#### Step 4: Enable pg_net Extension
Run in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

#### Step 5: Set Configuration
Run in Supabase SQL Editor:
```sql
ALTER DATABASE postgres SET app.supabase_url = 'https://YOUR_PROJECT.supabase.co';
ALTER DATABASE postgres SET app.supabase_service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

#### Step 6: Create Trigger
Run the script: `add_order_notification_trigger.sql`

---

## Quick Troubleshooting

### Check if trigger exists:
```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass 
  AND tgname LIKE '%order%';
```

### Check if extensions are enabled:
```sql
SELECT extname FROM pg_extension WHERE extname IN ('http', 'pg_net');
```

### Test the webhook manually:
```sql
-- This will trigger the webhook for the most recent order
SELECT send_order_webhook() FROM orders ORDER BY created_at DESC LIMIT 1;
```

### View PostgreSQL logs:
- Go to Supabase Dashboard > Database > Logs
- Look for errors related to webhooks or triggers

---

## Recommended Approach

**Use Option 1 (Zapier)** because:
- ✅ No code deployment needed
- ✅ Easy to test and debug
- ✅ Visual interface
- ✅ Can add more actions later (Slack, SMS, etc.)
- ✅ Free tier available
- ✅ More reliable for email delivery

---

## After Setup - Verify

1. Place a test order through Buy Now
2. Check Zapier task history (or Supabase function logs)
3. Verify email received
4. Check all order details are correct

---

## Common Issues

### Issue: Webhook not firing
**Solution**: Check if trigger is enabled and http extension is installed

### Issue: Email not received
**Solution**: 
- Check spam folder
- Verify email service is connected in Zapier
- Check Zapier task history for errors

### Issue: Missing product details
**Solution**: Ensure products table has brand and model columns populated

### Issue: Price showing as 0
**Solution**: Verify orders table has price column and it's being populated from BuyNowSheet.tsx

---

## Need Help?

1. Run `diagnose_email_issue.sql` and share the results
2. Check Zapier task history for error messages
3. Check Supabase logs for trigger errors
