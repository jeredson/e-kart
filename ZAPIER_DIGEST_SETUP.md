# Batch Email Setup with Zapier Digest

## Problem
The database sends one webhook per order, but we want one email for all cart items.

## Solution
Use Zapier's **Digest** feature to collect multiple webhooks and send them together.

## Setup Steps

### Step 1: Update Database Function
Run `fix_batch_email_simple.sql` in Supabase SQL Editor.

This sends individual webhooks but includes `batch_id` to group them.

### Step 2: Create New Zap

1. **Trigger: Webhooks by Zapier**
   - Event: Catch Hook
   - Copy the webhook URL and update it in the SQL file

2. **Filter: Only Continue If...**
   - Field: `order_type`
   - Condition: `(Text) Exactly matches`
   - Value: `batch`
   
   This ensures only cart orders go through (Buy Now orders skip to separate path)

3. **Action: Digest by Zapier**
   - Event: Append Entry and Schedule Digest
   - Key: `{{batch_id}}` (This groups orders by batch)
   - Value: Build the order details:
     ```
     Product: {{product_name}}
     Brand: {{brand}}
     Model: {{model}}
     Variants: {{variants}}
     Quantity: {{quantity}}
     Price: Rs.{{price}}
     Subtotal: Rs.{{subtotal}}
     ```
   - Time Delayed: `5 minutes` (or `1 minute` for faster testing)
   - Length of Digest: `100` (max orders to collect)

4. **Action: Gmail (Send Email)**
   - To: Your admin email
   - Subject: `New Batch Order - {{shop_name}}`
   - Body:
     ```
     New batch order received!
     
     Shop: {{shop_name}}
     Address: {{shop_address}}
     
     Orders:
     {{digest__value}}
     
     Order Date: {{created_at}}
     ```

### Step 3: Create Separate Path for Buy Now Orders

Go back and add a parallel path:

1. **Filter: Only Continue If...**
   - Field: `order_type`
   - Condition: `(Text) Exactly matches`
   - Value: `single`

2. **Action: Gmail (Send Email)**
   - To: Your admin email
   - Subject: `New Order - {{brand}} {{model}}`
   - Body:
     ```
     New order received!
     
     Product: {{product_name}}
     Brand: {{brand}}
     Model: {{model}}
     Variants: {{variants}}
     Quantity: {{quantity}}
     Price: Rs.{{price}}
     Subtotal: Rs.{{subtotal}}
     
     Shop: {{shop_name}}
     Address: {{shop_address}}
     
     Order Date: {{created_at}}
     ```

## How It Works

**Cart Checkout (Multiple Items):**
1. User checks out 3 items
2. Database sends 3 webhooks (one per item) with same `batch_id`
3. Zapier Digest collects all 3 for 5 minutes
4. After 5 minutes, sends ONE email with all 3 products

**Buy Now (Single Item):**
1. User clicks Buy Now
2. Database sends 1 webhook with `order_type: single`
3. Zapier sends immediate email (no digest)

## Testing

1. Add 2-3 items to cart and checkout
2. Wait 5 minutes (or your digest delay)
3. Check email - should have all products in one email

## Alternative: Instant Email (No Delay)

If you want instant emails without waiting, we need a different approach using Zapier's **Looping** or a custom webhook endpoint. Let me know if you need this!

## Troubleshooting

**Not receiving emails:**
- Check Zapier Task History
- Verify webhook URL in SQL matches Zapier
- Test the trigger in Zapier

**Receiving multiple emails:**
- Ensure Digest is set up correctly
- Check that `batch_id` is being used as the Key

**Digest not grouping:**
- Verify all orders have the same `batch_id`
- Check Digest delay is long enough (try 5 minutes)
