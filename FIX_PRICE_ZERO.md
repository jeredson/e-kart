# Fix Price Showing 0 in Zapier

## Problem
Price and Subtotal are showing 0 in Zapier webhook data.

## Solution

### 1. Verify Database Has Price Column
Run in Supabase SQL Editor:
```sql
SELECT id, product_id, quantity, price, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 1;
```

If `price` is NULL or 0, continue to step 2.

### 2. Clear Browser Cache & Rebuild App
The app code needs to be reloaded:

**Option A: Hard Refresh Browser**
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Option B: Restart Dev Server**
```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Place a NEW Order
- Go to your app (after clearing cache/restarting)
- Place a brand new order
- The price should now be saved

### 4. Check Database Again
Run in Supabase:
```sql
SELECT id, product_id, quantity, price, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 1;
```

The `price` column should now have a value (not 0 or NULL).

### 5. Check Zapier
- Go to Zapier → Zap History
- Find the newest order
- Price and Subtotal should now show actual values

### 6. Add to Email Body
In Zapier email action:
1. Click in the email body
2. Type: `Price per unit: ₹` then click the `+` icon
3. Select `Price` from the dropdown
4. Type: `Subtotal: ₹` then click the `+` icon
5. Select `Subtotal` from the dropdown

Or just type directly:
```
Price per unit: ₹{{price}}
Subtotal: ₹{{subtotal}}
```

## If Still Showing 0

Check if the app is actually calculating the price. Add console.log to verify:

In BuyNowSheet.tsx, before the insert, add:
```javascript
console.log('Inserting order with price:', currentPrice);
```

Then check browser console when placing order.
