# Email Notifications for Order Cancellation - Complete Guide

## Overview
We'll use **Supabase Edge Functions** to send emails when orders are cancelled. This is more reliable than webhooks.

---

## Option 1: Using Resend (Recommended - Easiest)

### Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for free account (100 emails/day free)
3. Go to **API Keys**
4. Click **Create API Key**
5. Copy the API key (starts with `re_`)

### Step 2: Add Resend API Key to Supabase

1. Go to Supabase Dashboard
2. Click **Project Settings** → **Edge Functions**
3. Scroll to **Secrets**
4. Add new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key
5. Click **Save**

### Step 3: Create Edge Function

1. In your project, create this file structure:
```
supabase/
  functions/
    send-cancel-email/
      index.ts
```

2. Create the file `supabase/functions/send-cancel-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { orderId, userId, productId, quantity, shopName } = await req.json()

    // Get user email from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}&select=email,first_name,last_name,shop_name`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    const users = await userResponse.json()
    const user = users[0]

    // Get product details
    const productResponse = await fetch(
      `${supabaseUrl}/rest/v1/products?id=eq.${productId}&select=name,brand,model`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    const products = await productResponse.json()
    const product = products[0]

    // Send email to user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Agnes Mobiles <onboarding@resend.dev>', // Change this to your verified domain
        to: [user.email],
        subject: `Order Cancelled - Order #${orderId.substring(0, 8)}`,
        html: `
          <h2>Your Order Has Been Cancelled</h2>
          <p>Hello ${user.first_name},</p>
          <p>Your order has been cancelled successfully.</p>
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order ID:</strong> ${orderId}</li>
            <li><strong>Product:</strong> ${product.brand} ${product.model}</li>
            <li><strong>Quantity:</strong> ${quantity}</li>
            <li><strong>Shop:</strong> ${shopName}</li>
          </ul>
          <p>If you have any questions, please contact us.</p>
          <p>Best regards,<br>Agnes Mobiles - B2B Team</p>
        `
      })
    })

    // Send email to admin
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Agnes Mobiles <onboarding@resend.dev>',
        to: ['admin@agnesmobiles.com'], // Change to your admin email
        subject: `Order Cancelled - ${shopName}`,
        html: `
          <h2>Order Cancelled</h2>
          <h3>Customer Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${user.first_name} ${user.last_name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Shop:</strong> ${user.shop_name}</li>
          </ul>
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Order ID:</strong> ${orderId}</li>
            <li><strong>Product:</strong> ${product.brand} ${product.model}</li>
            <li><strong>Quantity:</strong> ${quantity}</li>
          </ul>
        `
      })
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

### Step 4: Deploy Edge Function

Run these commands in your terminal:

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase functions deploy send-cancel-email
```

### Step 5: Create Database Trigger

Run this SQL in Supabase SQL Editor:

```sql
-- Create function to call Edge Function
CREATE OR REPLACE FUNCTION trigger_cancel_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_canceled = true AND (OLD.is_canceled = false OR OLD.is_canceled IS NULL) THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-cancel-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'orderId', NEW.id,
        'userId', NEW.user_id,
        'productId', NEW.product_id,
        'quantity', NEW.quantity,
        'shopName', NEW.shop_name
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS order_cancel_email_trigger ON orders;
CREATE TRIGGER order_cancel_email_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cancel_email();
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

### Step 6: Test

1. Cancel an order in your app
2. Check your email inbox
3. Check admin email inbox
4. Both should receive emails!

---

## Option 2: Simple Alternative (No Edge Function)

If you don't want to use Edge Functions, you can send emails directly from your React app:

### Step 1: Install Resend in your project

```bash
npm install resend
```

### Step 2: Update UserOrders.tsx

Add this code to the `cancelOrder` function:

```typescript
// After successfully canceling the order
if (!error) {
  // Send email notification
  try {
    await fetch('/api/send-cancel-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        userEmail: user.email,
        productName: order.product.name,
        quantity: order.quantity
      })
    });
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
    // Don't show error to user - order is still cancelled
  }
  
  toast.success('Order canceled successfully');
  loadOrders();
}
```

---

## Troubleshooting

### Edge Function not deploying
- Make sure you have Supabase CLI installed: `npm install -g supabase`
- Check you're logged in: `npx supabase login`
- Verify project is linked: `npx supabase projects list`

### Emails not sending
- Check Resend dashboard for delivery status
- Verify RESEND_API_KEY is set in Supabase secrets
- Check Edge Function logs in Supabase Dashboard

### Trigger not firing
- Run this to check if trigger exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'order_cancel_email_trigger';
  ```
- Check Supabase logs for errors

---

## Important Notes

1. **Free Tier Limits:**
   - Resend: 100 emails/day free
   - Supabase Edge Functions: 500,000 invocations/month free

2. **Email Domain:**
   - Change `onboarding@resend.dev` to your verified domain
   - Add your domain in Resend dashboard

3. **Admin Email:**
   - Change `admin@agnesmobiles.com` to your actual admin email

---

## Which Option Should I Choose?

**Choose Option 1 (Edge Functions) if:**
- ✅ You want reliable, server-side email sending
- ✅ You don't want to expose API keys in frontend
- ✅ You want automatic emails without user interaction

**Choose Option 2 (Frontend) if:**
- ✅ You want a quick, simple solution
- ✅ You're okay with emails only sending when user is online
- ✅ You don't want to set up Edge Functions

**Recommendation:** Use Option 1 (Edge Functions) for production.
