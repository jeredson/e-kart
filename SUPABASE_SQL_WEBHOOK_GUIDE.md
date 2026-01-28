# Supabase SQL Webhook Setup Guide

## Why Use SQL Instead of React?

✅ **Advantages:**
- Works even if React code fails
- No need to update frontend code
- Centralized in database
- More reliable
- Automatic for all orders

❌ **Disadvantages:**
- Harder to debug
- Requires Supabase http extension
- Can't easily turn off without SQL

---

## Step 1: Remove React Webhooks

First, remove the webhook code from your React files:

### Checkout.tsx
Remove this code (around line 290):
```typescript
// Send order notification to Zapier
try {
  await fetch('https://hooks.zapier.com/hooks/catch/26132431/uqvigh0/', {
    // ... webhook code
  });
} catch (webhookError) {
  console.error('Webhook error:', webhookError);
}
```

### BuyNowSheet.tsx
Remove the same webhook code (around line 240)

---

## Step 2: Get Zapier Webhook URL

1. Go to [zapier.com](https://zapier.com)
2. Create new Zap: "Order Notifications"
3. Webhooks by Zapier → Catch Hook
4. **COPY THE WEBHOOK URL**

---

## Step 3: Choose SQL Version

### Option A: Simple Version (Recommended)

**Use this if:** You want each order to send separately

**File:** `SUPABASE_ORDER_WEBHOOK_SIMPLE.sql`

**Pros:**
- Simple and reliable
- Easy to debug
- Works for both Buy Now and Checkout

**Cons:**
- Checkout orders send multiple webhooks (one per product)
- Need to group them in Zapier

### Option B: Batch Version (Advanced)

**Use this if:** You want checkout orders grouped together

**File:** `SUPABASE_ORDER_WEBHOOK.sql`

**Pros:**
- Groups checkout orders by batch_id
- Single webhook for multiple products

**Cons:**
- More complex
- Harder to debug
- May have timing issues

---

## Step 4: Run SQL in Supabase

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Copy the SQL from your chosen file
5. **Replace `YOUR_ZAPIER_WEBHOOK_URL`** with your actual URL
6. Click **Run**

---

## Step 5: Test the Trigger

### Test Buy Now:
1. Go to your app
2. Use Buy Now to order a product
3. Check Zapier - you should see the webhook data

### Test Checkout:
1. Add multiple items to cart
2. Go to Checkout
3. Place order
4. Check Zapier - you should see webhook(s)

---

## Step 6: Set Up Zapier Actions

### For Simple Version:

Since each order sends separately, you need to:

1. **Add Filter** (optional):
   - Only continue if `event_type` = `order_placed`

2. **Get Product Name:**
   - Webhooks by Zapier → GET
   - URL: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/products?id=eq.{{product_id}}&select=name,brand,model`

3. **Get User Email:**
   - Webhooks by Zapier → GET
   - URL: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/user_profiles?id=eq.{{user_id}}&select=email,first_name,last_name`

4. **Send Email:**
   - Gmail → Send Email
   - Use the data from previous steps

### For Batch Version:

Follow the JavaScript formatting guide in `ZAPIER_ORDER_EMAILS_COMPLETE.md`

---

## Troubleshooting

### Webhook not firing

**Check if trigger exists:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'order_notification_trigger';
```

**Check if function exists:**
```sql
SELECT proname FROM pg_proc WHERE proname = 'send_order_notification';
```

**Check Supabase logs:**
- Go to Database → Logs
- Look for errors

### HTTP extension error

**Enable extension:**
```sql
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
```

**Verify it's installed:**
```sql
SELECT * FROM pg_extension WHERE extname = 'http';
```

### Webhook sends but Zapier doesn't receive

- Check webhook URL is correct
- Check Zapier Task History for errors
- Try manually testing the webhook URL with curl

---

## Disable Webhook (If Needed)

To temporarily disable:
```sql
ALTER TABLE orders DISABLE TRIGGER order_notification_trigger;
```

To re-enable:
```sql
ALTER TABLE orders ENABLE TRIGGER order_notification_trigger;
```

To completely remove:
```sql
DROP TRIGGER IF EXISTS order_notification_trigger ON orders;
DROP FUNCTION IF EXISTS send_order_notification();
```

---

## Comparison: React vs SQL

| Feature | React Webhook | SQL Trigger |
|---------|--------------|-------------|
| Reliability | Medium | High |
| Easy to debug | ✅ Yes | ❌ No |
| Easy to disable | ✅ Yes | ❌ No |
| Works if React fails | ❌ No | ✅ Yes |
| Centralized | ❌ No | ✅ Yes |
| Browser console logs | ✅ Yes | ❌ No |

---

## Recommendation

**For Production:** Use SQL triggers (more reliable)
**For Development:** Use React webhooks (easier to debug)

**Best of Both Worlds:**
1. Use SQL triggers for production
2. Add console.log in React to verify orders are created
3. Check Zapier Task History to verify webhooks

---

## Summary

✅ **SQL triggers** send webhooks automatically when orders are inserted
✅ **No React code** needed
✅ **More reliable** than frontend webhooks
✅ **Works for** both Buy Now and Checkout
✅ **Easy to** enable/disable with SQL commands

🎉 **Done!**
