# Zapier Webhook Setup - Step by Step Guide

## Step 1: Create Zapier Account
1. Go to [zapier.com](https://zapier.com)
2. Sign up for a free account (free plan allows 100 tasks/month)

## Step 2: Create New Zap
1. Click **"Create Zap"** button (top left or center)
2. You'll see a workflow builder with Trigger and Action

## Step 3: Set Up Trigger (Webhooks by Zapier)
1. In the **Trigger** section, search for **"Webhooks by Zapier"**
2. Click on it
3. Select **"Catch Hook"** as the event
4. Click **"Continue"**
5. **IMPORTANT**: Copy the **Custom Webhook URL** shown (looks like: `https://hooks.zapier.com/hooks/catch/123456/abcdef/`)
6. Keep this page open - you'll need to test it later

## Step 4: Update Your SQL File
1. Open `add_order_webhook_simple.sql`
2. Find line 14: `webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE';`
3. Replace `YOUR_WEBHOOK_URL_HERE` with your Zapier webhook URL
4. Example:
   ```sql
   webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/123456/abcdef/';
   ```

## Step 5: Run SQL in Supabase
1. Go to your Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Paste the entire content of `add_order_webhook_simple.sql`
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see "Success. No rows returned"

## Step 6: Test the Webhook
1. Go back to your Zapier tab
2. Click **"Test trigger"**
3. In your E-Kart app, place a test order
4. Go back to Zapier and click **"Test trigger"** again
5. You should see the order data appear
6. Click **"Continue with selected record"**

## Step 7: Set Up Action (Send Email)
1. Click on the **Action** section
2. Search for **"Gmail"** (or "Email by Zapier" for simpler option)
3. Select **"Send Email"** as the event
4. Click **"Continue"**
5. Connect your Gmail account (follow the prompts)

## Step 8: Configure Email Template
1. **To**: Enter your admin email address
2. **Subject**: Click the `+` icon and build:
   ```
   New Order: [brand] [model]
   ```
   (Select `brand` and `model` from the dropdown)
3. **Body**: Click the `+` icon and build:
   ```
   New Order Received

   Product Details:
   - Brand: [brand]
   - Model: [model]
   - Variation: [variants]
   - Quantity: [quantity]

   Shop Details:
   - Shop Name: [shop_name]
   - Shop Address: [shop_address]

   Order ID: [order_id]
   Order Date: [created_at]
   ```
4. Click **"Continue"**

## Step 9: Test the Email
1. Click **"Test step"**
2. Check your admin email inbox
3. You should receive a test email with the order details
4. If successful, click **"Continue"**

## Step 10: Publish Your Zap
1. Give your Zap a name (e.g., "E-Kart Order Notifications")
2. Click **"Publish"** button (top right)
3. Your Zap is now live! 🎉

## Verification
Place a real order in your app and verify:
- ✅ Email arrives within 1-2 minutes
- ✅ All details are correct (brand, model, variants, quantity, shop info)

## Troubleshooting

**No webhook data received?**
- Verify the SQL was executed successfully in Supabase
- Check if `http` extension is enabled: Run `CREATE EXTENSION IF NOT EXISTS http;`
- Place another test order

**Email not sending?**
- Check Zapier task history (Dashboard > Zap History)
- Verify Gmail connection is active
- Check spam folder

**Wrong data in email?**
- Go back to Step 8 and remap the fields
- Make sure you're selecting the correct data fields from the webhook

## Alternative: Email by Zapier (No Gmail Required)
If you don't want to use Gmail:
1. In Step 7, search for **"Email by Zapier"**
2. Select **"Send Outbound Email"**
3. Configure the same way as Gmail
4. Note: Emails come from `noreply@zapier.com`

## Cost
- Free plan: 100 orders/month
- Paid plan: Unlimited orders (starts at $19.99/month)
