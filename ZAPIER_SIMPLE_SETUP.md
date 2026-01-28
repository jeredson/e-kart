# Simple Zapier Setup for Order Notifications

## Data Sent to Zapier

Each order (Buy Now or Checkout) sends:
- **order_id**: Unique order ID
- **batch_id**: Batch ID (same for all items in checkout, null for Buy Now)
- **product_name**: Product name
- **brand**: Product brand
- **model**: Product model
- **variants**: Selected variants (e.g., "Color: Blue, Ram: 8GB, Storage: 128GB")
- **quantity**: Order quantity
- **unit_price**: Price per unit
- **subtotal**: Total (quantity × unit_price)
- **shop_name**: Customer's shop name
- **shop_address**: Customer's shop address
- **order_date**: Order date (DD/MM/YYYY format)

## Setup Steps

### 1. Create Zapier Webhook
1. Go to [Zapier](https://zapier.com)
2. Click "Create Zap"
3. Trigger: "Webhooks by Zapier" → "Catch Hook"
4. Copy the webhook URL (e.g., `https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/`)

### 2. Update Database
1. Open Supabase SQL Editor
2. Open `setup_zapier_webhook.sql`
3. Replace `YOUR_ZAPIER_WEBHOOK_URL` with your actual webhook URL
4. Run the script

### 3. Test the Webhook
1. Place a test order (Buy Now or Checkout)
2. Go back to Zapier
3. Click "Test trigger" - you should see the order data

### 4. Set Up Email Action
1. Add action: "Gmail" or "Email by Zapier"
2. To: Your admin email
3. Subject: `New Order: {{brand}} {{model}}`
4. Body: Use template below

### Email Template

```
New Order Received!

Order ID: {{order_id}}
{{#batch_id}}Batch ID: {{batch_id}}{{/batch_id}}

Product Details:
- Brand: {{brand}}
- Model: {{model}}
- Product: {{product_name}}
- Variants: {{variants}}
- Quantity: {{quantity}}
- Unit Price: ₹{{unit_price}}
- Subtotal: ₹{{subtotal}}

Shop Details:
- Shop Name: {{shop_name}}
- Shop Address: {{shop_address}}

Order Date: {{order_date}}
```

### 5. Turn On Zap
Click "Publish" to activate

## How It Works

### Buy Now (Single Product)
- Creates 1 order
- batch_id is null
- Sends 1 webhook to Zapier
- You receive 1 email

### Checkout (Multiple Products)
- Creates multiple orders (one per product)
- All orders share the same batch_id
- Sends multiple webhooks (one per product)
- You receive multiple emails (one per product)

## Troubleshooting

### No webhook received in Zapier
```sql
-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_order_webhook';

-- Check if http extension is enabled
SELECT * FROM pg_extension WHERE extname = 'http';
```

### Test manually
```sql
-- Place a test order, then check if it was sent
SELECT id, batch_id, product_id, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

## Notes
- Each product in checkout gets its own email (grouped by batch_id)
- Orders never fail even if webhook fails
- Webhook errors are logged but don't affect order creation
