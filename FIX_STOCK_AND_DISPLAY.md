# Fix: Stock Updates and CMF Buds Stock Display

## Issues Fixed:
1. Stock not updating after purchase
2. Nothing CMF Buds stock not showing in product modal

## Solution Steps:

### Step 1: Fix Stock Update Policy
Run this in Supabase SQL Editor:

```sql
-- Drop any conflicting policies
DROP POLICY IF EXISTS "Allow users to update product stock" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update product stock" ON products;

-- Create proper policy for stock updates
CREATE POLICY "Allow authenticated users to update product stock"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

### Step 2: Fix Webhook Trigger (if using Zapier)
Run this in Supabase SQL Editor (replace YOUR_WEBHOOK_URL_HERE with your actual Zapier webhook URL):

```sql
-- Drop existing triggers
DROP TRIGGER IF EXISTS on_order_webhook ON orders;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS send_order_webhook();
DROP FUNCTION IF EXISTS notify_admin_new_order();

-- Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Create webhook function (non-blocking)
CREATE OR REPLACE FUNCTION send_order_webhook()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
  variant_text TEXT;
  webhook_url TEXT := 'YOUR_WEBHOOK_URL_HERE'; -- Replace with your Zapier webhook URL
  http_response http_response;
BEGIN
  SELECT name, brand, model INTO product_data
  FROM products
  WHERE id = NEW.product_id;
  
  SELECT string_agg(key || ': ' || value, ', ')
  INTO variant_text
  FROM jsonb_each_text(NEW.variants);
  
  BEGIN
    SELECT * INTO http_response FROM http_post(
      webhook_url,
      jsonb_build_object(
        'order_id', NEW.id,
        'brand', COALESCE(product_data.brand, 'N/A'),
        'model', COALESCE(product_data.model, product_data.name, 'N/A'),
        'product_name', product_data.name,
        'variants', COALESCE(variant_text, 'None'),
        'quantity', NEW.quantity,
        'shop_name', NEW.shop_name,
        'shop_address', NEW.shop_address,
        'created_at', NEW.created_at
      )::text,
      'application/json'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Webhook notification failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_order_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_webhook();
```

### Step 3: Frontend Fix (Already Applied)
The ProductDetailModal.tsx has been updated to:
- Remove the requirement for 3+ variants to show stock
- Now shows stock for products with any number of variants (including CMF Buds)

### Step 4: Test
1. Clear browser cache and reload the app
2. Open Nothing CMF Buds product - stock should now be visible
3. Place a test order
4. Verify stock decreases
5. Check admin email for order notification

## Why This Works:

**Stock Update Issue:**
- The RLS policy now properly allows authenticated users to update product stock
- The webhook trigger is AFTER INSERT, so it doesn't block the order creation
- Stock updates happen in the frontend before order insertion

**CMF Buds Stock Display:**
- Removed the `hasAllRequiredVariants >= 3` check
- Now matches variants regardless of count
- Works for products with 1, 2, or 3+ variant types

## Verification:
```sql
-- Check if policy exists
SELECT policyname FROM pg_policies WHERE tablename = 'products' AND cmd = 'UPDATE';

-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_order_webhook';
```
