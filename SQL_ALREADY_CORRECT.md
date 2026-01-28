# FINAL_WEBHOOK.sql is Already Correct!

The existing `FINAL_WEBHOOK.sql` file already sends the correct format for Zapier.

## What it does:
1. **Buy Now orders** (batch_id = NULL): Sends immediately with single product
2. **Checkout orders** (batch_id exists): Waits 1 second, collects all products in batch

## Data sent to Zapier:
```json
{
  "batch_id": "uuid-here",
  "shop_name": "Chennai Mobiles",
  "shop_address": "Chennai",
  "created_at": "2026-01-28T13:35:00Z",
  "products": [
    {
      "name": "OnePlus 15R 5G",
      "variants": {"Color": "Black", "Ram": "8GB"},
      "quantity": 2,
      "price": 47999
    }
  ]
}
```

## Only change needed:
Line 16: Replace with your Zapier webhook URL
```sql
webhook_url TEXT := 'YOUR_ZAPIER_WEBHOOK_URL_HERE';
```

## Then:
1. Run the SQL in Supabase
2. Use the JavaScript code from `zapier-final.js`
3. Done!
