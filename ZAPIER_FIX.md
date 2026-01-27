# Fix Buy Now Emails with Zapier

## The Problem
- Checkout (cart) emails work ✅
- Buy Now emails don't work ❌

## Root Cause
The `orders` table is missing columns that BuyNowSheet is trying to insert:
- `price` - The product price
- `variant_image` - The selected variant image
- `batch_id` - Used to group cart orders together

## Solution

### Step 1: Add Missing Columns to Database
Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_image TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id UUID;
```

### Step 2: Understand Your Zapier Setup

Your Zapier probably has filters like:

**For Cart Checkout Emails:**
- Trigger: New row in `orders` table
- Filter: `batch_id` is not empty
- Action: Send email with all products in that batch

**For Buy Now Emails:**
- Trigger: New row in `orders` table  
- Filter: `batch_id` is empty (or null)
- Action: Send email for single product

### Step 3: Test Buy Now
After running the SQL:
1. Place a test order using "Buy Now"
2. Check your Zapier task history
3. Verify the email is sent

## How It Works

### Checkout (Cart)
```javascript
// Multiple items get same batch_id
const batchId = crypto.randomUUID();
orders = [
  { product_id: 'A', batch_id: batchId, price: 100, ... },
  { product_id: 'B', batch_id: batchId, price: 200, ... }
]
```
Zapier groups these by `batch_id` and sends one email with all products.

### Buy Now
```javascript
// Single item, no batch_id
order = {
  product_id: 'A',
  batch_id: null,  // or undefined
  price: 100,
  ...
}
```
Zapier sends email for this single product.

## Zapier Filter Examples

### For Cart Checkout:
- **Filter**: Only continue if `batch_id` exists
- **Condition**: `batch_id` is not empty

### For Buy Now:
- **Filter**: Only continue if `batch_id` is empty
- **Condition**: `batch_id` is empty OR `batch_id` does not exist

## Troubleshooting

### If Buy Now still doesn't send emails:
1. Check Zapier task history - is the trigger firing?
2. Check the filter conditions - is it being blocked?
3. Verify the order was created in Supabase
4. Check if `price` and `variant_image` are populated

### If you see product details empty:
The product details should come from joining with the `products` table in your Zapier action.
Make sure your Zapier step fetches product details using `product_id`.
