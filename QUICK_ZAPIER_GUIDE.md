# Quick Setup Guide - Zapier Email Notifications

## 🚀 3-Step Setup

### Step 1: Get Zapier Webhook URL (2 minutes)
1. Go to zapier.com → Create Zap
2. Trigger: "Webhooks by Zapier" → "Catch Hook"
3. Copy webhook URL: `https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/`

### Step 2: Run Database Script (1 minute)
1. Open Supabase SQL Editor
2. Open file: `COMPLETE_ZAPIER_SETUP.sql`
3. Replace `YOUR_ZAPIER_WEBHOOK_URL` with your webhook URL
4. Click "Run"

### Step 3: Configure Email in Zapier (3 minutes)
1. Place test order in your app
2. Zapier catches the data
3. Add action: "Gmail" or "Email by Zapier"
4. Configure email (see template below)
5. Turn Zap ON

---

## 📧 Email Template for Zapier

**Subject:**
```
New Order: {{brand}} {{model}}
```

**Body:**
```
🛒 NEW ORDER RECEIVED

📦 Order Details:
Order ID: {{order_id}}
Batch ID: {{batch_id}}

🏷️ Product:
Brand: {{brand}}
Model: {{model}}
Name: {{product_name}}
Variants: {{variants}}

💰 Pricing:
Quantity: {{quantity}}
Unit Price: ₹{{unit_price}}
Subtotal: ₹{{subtotal}}

🏪 Shop Details:
Name: {{shop_name}}
Address: {{shop_address}}

📅 Date: {{order_date}}
```

---

## 📊 Data Fields Available in Zapier

| Field | Description | Example |
|-------|-------------|---------|
| order_id | Unique order ID | abc-123-def |
| batch_id | Batch ID (checkout orders) | xyz-456-ghi |
| product_name | Product name | iPhone 15 Pro |
| brand | Brand name | Apple |
| model | Model name | iPhone 15 Pro |
| variants | Selected options | Color: Blue, Ram: 8GB |
| quantity | Order quantity | 2 |
| unit_price | Price per unit | 89999 |
| subtotal | Total amount | 179998 |
| shop_name | Customer shop name | Tech Store |
| shop_address | Customer address | 123 Main St |
| order_date | Order date | 15/01/2024 |

---

## 🔍 How It Works

### Buy Now (Single Product)
- 1 order created
- batch_id = null
- 1 email sent

### Checkout (Multiple Products)
- Multiple orders created
- Same batch_id for all
- Multiple emails (one per product)

---

## ✅ Verify Setup

Run in Supabase SQL Editor:
```sql
-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_order_webhook';

-- Check extension enabled
SELECT extname FROM pg_extension WHERE extname = 'http';

-- View recent orders
SELECT id, batch_id, created_at FROM orders ORDER BY created_at DESC LIMIT 5;
```

---

## 🐛 Troubleshooting

**No webhook in Zapier?**
- Check webhook URL is correct in the SQL function
- Verify http extension is enabled
- Place a new test order

**Email not sending?**
- Check Zapier task history for errors
- Verify email service is connected
- Check spam folder

**Missing data in email?**
- Verify products table has brand/model columns
- Check orders table has price column
- Ensure variants are being saved

---

## 📝 Files Created

1. `COMPLETE_ZAPIER_SETUP.sql` - Run this in Supabase
2. `ZAPIER_SIMPLE_SETUP.md` - Detailed guide
3. `ensure_orders_columns.sql` - Column verification
4. `setup_zapier_webhook.sql` - Core webhook setup

---

## 💡 Tips

- Test with Buy Now first (simpler)
- Then test with Checkout (batch orders)
- Check Zapier task history to debug
- Orders never fail even if webhook fails
- You can add more Zapier actions (Slack, SMS, etc.)
