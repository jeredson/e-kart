# Fix for Empty Product Details in Buy Now Order Emails

## Problem
When placing an order through "Buy Now", you get a 400 error: `schema "net" does not exist`

This is because:
1. The `orders` table is missing `price` and `variant_image` columns
2. The trigger approach requires pg_net extension which may not be enabled

## Simple Solution

### Step 1: Add Missing Columns
Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;
```

### Step 2: Set Up Email Notifications (Choose One Method)

#### Method A: Database Webhook (Recommended - No Extension Required)
1. Go to Supabase Dashboard → Database → Webhooks
2. Click "Create a new hook"
3. Configure:
   - **Name**: `send-order-notification`
   - **Table**: `orders`
   - **Events**: Check "Insert"
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://[YOUR-PROJECT-REF].supabase.co/functions/v1/send-order-notification`
   - **HTTP Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer [YOUR-SERVICE-ROLE-KEY]
     ```
   - **HTTP Params**: Leave as `record`

#### Method B: Enable pg_net and Use Trigger
If you prefer triggers, first enable the extension:

```sql
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to trigger email notification
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-order-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();
```

### Step 3: Ensure Email Function is Deployed
Make sure the updated email function is deployed:

```bash
npx supabase functions deploy send-order-notification
```

And set these secrets in Supabase Dashboard → Edge Functions → Secrets:
- `RESEND_API_KEY`: Your Resend API key
- `ADMIN_EMAIL`: Email to receive notifications

## Email Format
The email will now show:

```
A new order has been received.

PRODUCT DETAILS
- Product Name: [Product Name]
- Brand: [Brand]
- Model: [Model]
- Description: [Description]
- Selected Variation: [Variants]
- Quantity: [Quantity]
- Price per unit: ₹[Price]
- Subtotal: ₹[Total]

SHOP DETAILS
- Shop Name: [Shop Name]
- Shop Address: [Shop Address]

Batch ID: [Order ID]
Order Date: [Date]
```

## Troubleshooting

### If emails still show empty product details:
1. Check that the migration ran successfully
2. Verify the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_order_created';`
3. Check Supabase function logs for errors
4. Ensure RESEND_API_KEY and ADMIN_EMAIL are set in Supabase dashboard

### If trigger isn't firing:
1. Make sure you have the `pg_net` extension enabled
2. Check Supabase logs for trigger errors
3. Verify the function has proper permissions

## Notes
- The trigger uses Supabase's `net.http_post` to call the edge function
- Product details are fetched from the products table using the product_id
- If a product is deleted, the email will show "Product details not available"
