# Zapier Email Notifications - React App Method

## Overview
Send order cancellation emails by calling Zapier directly from your React app when the cancel button is clicked.

---

## Step 1: Get Zapier Webhook URL (2 minutes)

1. Go to [zapier.com](https://zapier.com) and log in
2. Click **Create Zap**
3. Name it: "Order Cancellation Emails"
4. Search for **"Webhooks by Zapier"**
5. Choose **"Catch Hook"**
6. Click **Continue**
7. **COPY THE WEBHOOK URL** (e.g., `https://hooks.zapier.com/hooks/catch/12345/abcde/`)
8. Keep this tab open

---

## Step 2: Update UserOrders.tsx (5 minutes)

Open `src/pages/UserOrders.tsx` and update the `cancelOrder` function:

### Find this code (around line 93):
```typescript
const { error } = await supabase
  .from('orders')
  .update({ is_canceled: true })
  .eq('id', orderId);

if (error) {
  console.error('Cancel error:', error);
  toast.error('Failed to cancel order');
} else {
  toast.success('Order canceled successfully');
  loadOrders();
}
```

### Replace with this:
```typescript
const { error } = await supabase
  .from('orders')
  .update({ is_canceled: true })
  .eq('id', orderId);

if (error) {
  console.error('Cancel error:', error);
  toast.error('Failed to cancel order');
} else {
  toast.success('Order canceled successfully');
  
  // Send notification to Zapier
  try {
    await fetch('YOUR_ZAPIER_WEBHOOK_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        user_id: user?.id,
        product_id: order.product_id,
        quantity: order.quantity,
        shop_name: order.shop_name,
        cancelled_at: new Date().toISOString()
      })
    });
  } catch (webhookError) {
    console.error('Webhook error:', webhookError);
    // Don't show error to user - order is still cancelled
  }
  
  loadOrders();
}
```

**Replace `YOUR_ZAPIER_WEBHOOK_URL`** with the URL from Step 1.

---

## Step 3: Update AdminOrders.tsx (5 minutes)

Open `src/pages/AdminOrders.tsx` and find the `handleCancelOrder` function (around line 80):

### Find this code:
```typescript
const { error } = await supabase
  .from('orders')
  .update({ is_canceled: true })
  .eq('id', orderId);

if (error) {
  toast.error('Failed to cancel order');
} else {
  toast.success('Order cancelled successfully');
  loadOrders();
}
```

### Replace with this:
```typescript
const { error } = await supabase
  .from('orders')
  .update({ is_canceled: true })
  .eq('id', orderId);

if (error) {
  toast.error('Failed to cancel order');
} else {
  toast.success('Order cancelled successfully');
  
  // Send notification to Zapier
  try {
    const orderData = orders.find(o => o.id === orderId);
    await fetch('YOUR_ZAPIER_WEBHOOK_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        user_id: orderData?.user_id,
        product_id: orderData?.product_id,
        quantity: orderData?.quantity,
        shop_name: orderData?.shop_name,
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'admin'
      })
    });
  } catch (webhookError) {
    console.error('Webhook error:', webhookError);
  }
  
  loadOrders();
}
```

**Replace `YOUR_ZAPIER_WEBHOOK_URL`** with the URL from Step 1.

---

## Step 4: Test the Connection (2 minutes)

1. Save both files
2. Go to your E-Kart app
3. Cancel an order
4. Go back to Zapier
5. Click **Test trigger**
6. You should see the order data
7. Click **Continue**

---

## Step 5: Set Up Zapier Actions (10 minutes)

### 5.1 Get User Email

1. Click **+** to add action
2. Search **"Webhooks by Zapier"**
3. Choose **GET**
4. Click **Continue**

**Configure:**
- **URL:** `https://YOUR_PROJECT.supabase.co/rest/v1/user_profiles?id=eq.{{user_id}}&select=email,first_name,last_name,shop_name`
- **Headers:**
  - `apikey`: Your Supabase anon key
  - `Authorization`: `Bearer YOUR_SUPABASE_ANON_KEY`

5. Click **Continue** → **Test action** → **Continue**

### 5.2 Get Product Details

1. Click **+** to add action
2. Search **"Webhooks by Zapier"**
3. Choose **GET**

**Configure:**
- **URL:** `https://YOUR_PROJECT.supabase.co/rest/v1/products?id=eq.{{product_id}}&select=name,brand,model`
- **Headers:** (same as above)

4. Click **Continue** → **Test action** → **Continue**

### 5.3 Send Email to Customer

1. Click **+** to add action
2. Search **"Gmail"**
3. Choose **"Send Email"**
4. Connect your Gmail account

**Configure:**
- **To:** `{{email}}`
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
Cancelled At: {{cancelled_at}}

If you have any questions, please contact us.

Best regards,
Agnes Mobiles - B2B Team
```

5. Click **Continue** → **Test action** → **Continue**

### 5.4 Send Email to Admin

1. Click **+** to add action
2. Search **"Gmail"**
3. Choose **"Send Email"**

**Configure:**
- **To:** `your-admin-email@gmail.com`
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
Cancelled At: {{cancelled_at}}
Cancelled By: {{cancelled_by}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agnes Mobiles - B2B System
```

4. Click **Continue** → **Test action** → **Continue**

---

## Step 6: Publish & Test (2 minutes)

1. Click **Publish**
2. Turn on the Zap
3. Go to your app
4. Cancel an order
5. Check both emails
6. ✅ Done!

---

## Advantages of This Method

✅ **No database triggers** - Cancel button always works
✅ **Simple to debug** - Check browser console for errors
✅ **Easy to modify** - Just edit React code
✅ **Works immediately** - No Supabase extension needed
✅ **Reliable** - Sends webhook when user clicks cancel

---

## Troubleshooting

### Cancel works but no email
- Check browser console for webhook errors
- Verify webhook URL is correct in both files
- Check Zapier Task History

### CORS error
- This is normal - webhook still works
- Zapier doesn't return CORS headers
- Ignore the error in console

### Email not sending
- Check Zapier Task History
- Verify Gmail is connected
- Check spam folder

---

## Summary

**What you did:**
1. ✅ Got Zapier webhook URL
2. ✅ Updated UserOrders.tsx to call webhook
3. ✅ Updated AdminOrders.tsx to call webhook
4. ✅ Set up Zapier to send emails

**What happens now:**
- User/Admin cancels order → React app calls Zapier
- Zapier fetches user and product details
- Emails sent to customer and admin

**No database triggers needed!** 🎉
