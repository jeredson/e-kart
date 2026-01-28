# Zapier Order Confirmation Emails

## What This Does
Sends email notifications to customer and admin when a new order is placed.

---

## Step 1: Create Zapier Webhook

1. Go to [zapier.com](https://zapier.com)
2. Click **Create Zap**
3. Name it: "Order Confirmation Emails"
4. Search **"Webhooks by Zapier"**
5. Choose **"Catch Hook"**
6. Click **Continue**
7. **COPY THE WEBHOOK URL**
8. Keep tab open

---

## Step 2: Update Checkout.tsx

✅ **Already done!** The webhook is already added to your code at:
```
https://hooks.zapier.com/hooks/catch/26132431/ulyrew2/
```

---

## Step 3: Test the Webhook

1. Go to your E-Kart app
2. Add items to cart
3. Go to Checkout
4. Click **"Place Order"**
5. Go back to Zapier
6. Click **"Test trigger"**
7. You should see order data
8. Click **Continue**

---

## Step 4: Get User Email

1. Click **+** to add action
2. Search **"Webhooks by Zapier"**
3. Choose **GET**

**Configure:**
- **URL:** `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/user_profiles?id=eq.{{user_id}}&select=email,first_name,last_name`
- **Query String Params:** Leave empty
- **Headers:**
  - Key: `apikey` | Value: Your Supabase anon key
  - Key: `Authorization` | Value: `Bearer YOUR_SUPABASE_ANON_KEY`
- **Wrap Response in Array:** No

4. Click **Continue**
5. Click **Test action**
6. **IMPORTANT:** The response will be an array. In the next steps, use:
   - `{{email__0}}` for email (first item in array)
   - `{{first_name__0}}` for first name
   - `{{last_name__0}}` for last name
7. Click **Continue**

---

## Step 5: Send Email to Customer

1. Click **+** to add action
2. Search **"Gmail"**
3. Choose **"Send Email"**
4. Connect Gmail

**Configure:**
- **To:** `{{email__0}}` (note the __0 at the end)
- **Subject:** `Order Confirmed - Agnes Mobiles - B2B`
- **Body:**
```
Hello {{first_name__0}},

Thank you for your order!

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{batch_id}}
Shop: {{shop_name}}
Address: {{shop_address}}
Total Items: {{total_items}}
Total Amount: ₹{{total_amount}}
Ordered At: {{ordered_at}}

Your order has been received and is being processed.
We'll notify you when it's ready for delivery.

Best regards,
Agnes Mobiles - B2B Team
```

5. Click **Continue** → **Test** → **Continue**

---

## Step 6: Send Email to Admin

1. Click **+** to add action
2. Search **"Gmail"**
3. Choose **"Send Email"**

**Configure:**
- **To:** `your-admin-email@gmail.com`
- **Subject:** `New Order - {{shop_name}} - ₹{{total_amount}}`
- **Body:**
```
New order received!

Customer Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: {{first_name__0}} {{last_name__0}}
Email: {{email__0}}
Shop: {{shop_name}}
Address: {{shop_address}}

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{batch_id}}
Total Items: {{total_items}}
Total Amount: ₹{{total_amount}}
Ordered At: {{ordered_at}}

View in Admin Panel:
https://your-domain.com/admin/orders

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agnes Mobiles - B2B System
```

4. Click **Continue** → **Test** → **Continue**

---

## Step 7: Publish & Test

1. Click **Publish**
2. Turn on the Zap
3. Place a test order in your app
4. Check both emails
5. ✅ Done!

---

## What Data is Sent

```json
{
  "batch_id": "unique-order-id",
  "user_id": "user-uuid",
  "shop_name": "Shop Name",
  "shop_address": "Shop Address",
  "total_items": 3,
  "total_amount": 45000,
  "orders": [
    {
      "product_id": "product-uuid",
      "quantity": 2,
      "price": 15000,
      "variants": {"Color": "Black", "RAM": "8GB"}
    }
  ],
  "ordered_at": "2024-01-15T10:30:00Z"
}
```

---

## Summary

✅ **Order placed** → Webhook sent to Zapier
✅ **Zapier fetches** user email
✅ **Customer receives** order confirmation
✅ **Admin receives** new order notification

🎉 **All done!**
