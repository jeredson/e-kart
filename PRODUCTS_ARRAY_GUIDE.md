# Zapier Webhook - Products Array Format

## Data Structure Sent to Zapier

**Single webhook per order/batch** containing:

```json
{
  "batch_id": "uuid-or-null",
  "order_id": "first-order-uuid",
  "products": [
    {
      "product_name": "iPhone 15 Pro",
      "brand": "Apple",
      "model": "iPhone 15 Pro",
      "variants": "Color: Blue, Ram: 8GB, Storage: 256GB",
      "quantity": 2,
      "unit_price": 89999,
      "subtotal": 179998
    },
    {
      "product_name": "Samsung Galaxy S24",
      "brand": "Samsung",
      "model": "Galaxy S24",
      "variants": "Color: Black, Ram: 12GB, Storage: 512GB",
      "quantity": 1,
      "unit_price": 79999,
      "subtotal": 79999
    }
  ],
  "total_amount": 259997,
  "shop_name": "Tech Store",
  "shop_address": "123 Main Street",
  "order_date": "15/01/2024"
}
```

## How It Works

### Buy Now (Single Product)
- Creates 1 order
- `batch_id` = null
- `products` array has 1 item
- Sends 1 webhook
- You get 1 email

### Checkout (Multiple Products)
- Creates multiple orders with same `batch_id`
- `products` array has all items
- Sends 1 webhook (not multiple)
- You get 1 email with all products

## Setup

1. **Run SQL Script:**
   ```
   zapier_products_array.sql
   ```

2. **Zapier Setup:**
   - Trigger: Webhooks by Zapier → Catch Hook
   - Action: Gmail/Email by Zapier

3. **Email Template:**

**Subject:**
```
New Order - {{shop_name}}
```

**Body:**
```
🛒 NEW ORDER

📅 Date: {{order_date}}
{{#batch_id}}🔢 Batch ID: {{batch_id}}{{/batch_id}}

🏪 Shop Details:
Name: {{shop_name}}
Address: {{shop_address}}

📦 Products:
{{#products}}
---
Product: {{product_name}}
Brand: {{brand}} | Model: {{model}}
Variants: {{variants}}
Quantity: {{quantity}} × ₹{{unit_price}} = ₹{{subtotal}}
{{/products}}

💰 TOTAL: ₹{{total_amount}}
```

## Accessing Products Array in Zapier

In Zapier, the `products` field will be an array. To display all products:

1. **Option 1: Use Looping by Zapier**
   - Add "Looping by Zapier" action
   - Loop through `products` array
   - Send separate email for each (not recommended)

2. **Option 2: Use Formatter (Recommended)**
   - Add "Formatter by Zapier"
   - Action: Utilities → Line Items to Text
   - Input: `products`
   - This converts array to readable text

3. **Option 3: Use Code by Zapier**
   - Add "Code by Zapier"
   - Format products array as HTML table
   - Use in email body

## Simple Email Setup (No Looping)

Use this in Gmail/Email body to show products:

```
Products Ordered:
{{products}}
```

Zapier will automatically format the array as text.

## Files

- `zapier_products_array.sql` - Run this in Supabase
- This guide - Reference for setup
