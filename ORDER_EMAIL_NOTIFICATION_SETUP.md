# Order Email Notification Setup

This guide explains how to set up email notifications to the admin when a user places an order.

## Features

When a user places an order, the admin receives an email with:
- Brand name and model
- Selected variation (e.g., Color, RAM, Storage)
- Quantity ordered
- Shop name
- Shop address
- Order ID and timestamp

## Setup Steps

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 3. Set Up Resend Account

1. Sign up at [Resend](https://resend.com)
2. Verify your domain or use their test domain
3. Get your API key from the dashboard

### 4. Set Environment Variables

Set these secrets in your Supabase project:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set ADMIN_EMAIL=admin@yourdomain.com
```

Or set them in the Supabase Dashboard:
- Go to Project Settings > Edge Functions
- Add the secrets there

### 5. Deploy the Edge Function

```bash
supabase functions deploy send-order-notification
```

### 6. Enable pg_net Extension

Run this in your Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 7. Set Configuration Parameters

Run this in your Supabase SQL Editor (replace with your actual values):

```sql
ALTER DATABASE postgres SET app.supabase_url = 'https://your-project-ref.supabase.co';
ALTER DATABASE postgres SET app.supabase_service_role_key = 'your-service-role-key';
```

### 8. Run the Migration

Execute the SQL file `add_order_notification_trigger.sql` in your Supabase SQL Editor.

## Alternative: Using Supabase Webhooks (Simpler Setup)

If you prefer not to use Edge Functions, you can use Supabase Database Webhooks:

1. Go to Database > Webhooks in Supabase Dashboard
2. Create a new webhook for the `orders` table
3. Set the event to `INSERT`
4. Point it to an external service (like Zapier, Make.com, or your own API endpoint)
5. The webhook will send the order data to your endpoint
6. Your endpoint can then send the email

## Testing

1. Place a test order through the app
2. Check the admin email inbox
3. Verify all order details are included

## Troubleshooting

- Check Edge Function logs: `supabase functions logs send-order-notification`
- Verify secrets are set correctly
- Ensure pg_net extension is enabled
- Check that the trigger is created: `SELECT * FROM pg_trigger WHERE tgname = 'on_order_created';`

## Email Template Customization

Edit the HTML in `supabase/functions/send-order-notification/index.ts` to customize the email format.

## Notes

- The email is sent asynchronously and won't block the order creation
- If email sending fails, the order will still be created successfully
- Consider adding error logging for production use
