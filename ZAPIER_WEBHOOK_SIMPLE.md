# Simple Zapier Webhook Setup for Buy Now Orders

## Step 1: Create Zapier Webhook

1. Go to Zapier → Create Zap
2. **Trigger**: Webhooks by Zapier → Catch Hook
3. Copy the webhook URL (e.g., `https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/`)

## Step 2: Configure Supabase Webhook

1. Go to Supabase Dashboard → Database → Webhooks
2. Click "Create a new hook"
3. Configure:
   - **Name**: `order-notification`
   - **Table**: `orders`
   - **Events**: ✓ Insert
   - **Type**: HTTP Request
   - **Method**: POST
   - **URL**: Paste your Zapier webhook URL
   - **HTTP Params**: `record`

## Step 3: Test the Webhook

1. Place a test order (Buy Now or Checkout)
2. Go back to Zapier
3. Click "Test trigger"
4. You should see the order data

## Step 4: Add Filter for Buy Now

1. Add **Filter by Zapier** step
2. **Only continue if...**
   - `record batch_id` (Text) `Does not exist`

This ensures only Buy Now orders (without batch_id) continue.

## Step 5: Fetch Product Details

1. Add **Webhooks by Zapier** → **GET**
2. **URL**: 
   ```
   https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/products?id=eq.{{record__product_id}}&select=*
   ```
3. **Headers**:
   - Key: `apikey` | Value: `YOUR_SUPABASE_ANON_KEY`
   - Key: `Authorization` | Value: `Bearer YOUR_SUPABASE_ANON_KEY`

**Where to find your anon key:**
- Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

## Step 6: Send Email

1. Add **Gmail** or **Email by Zapier**
2. **To**: Your admin email
3. **Subject**: 
   ```
   New Order: {{2__0__brand}} {{2__0__model}}
   ```
4. **Body**:
   ```
   A new order has been received.

   PRODUCT DETAILS
   Product Name: {{2__0__name}}
   Brand: {{2__0__brand}}
   Model: {{2__0__model}}
   Description: {{2__0__description}}
   Selected Variation: {{record__variants}}
   Quantity: {{record__quantity}}
   Price per unit: ₹{{record__price}}
   Subtotal: ₹{{record__price}} × {{record__quantity}}

   SHOP DETAILS
   Shop Name: {{record__shop_name}}
   Shop Address: {{record__shop_address}}

   Batch ID: {{record__id}}
   Order Date: {{record__created_at}}
   ```

**Note**: `{{2__0__name}}` means:
- `2` = Step 2 (the GET request)
- `0` = First item in array
- `name` = Field name

## Step 7: Turn On Zap

Click "Publish" to activate your Zap!

---

## Data Structure Reference

### Webhook Payload (from Supabase)
```json
{
  "type": "INSERT",
  "table": "orders",
  "record": {
    "id": "uuid",
    "user_id": "uuid",
    "product_id": "uuid",
    "quantity": 1,
    "price": 25000,
    "variants": {"Color": "Icy purple", "Ram": "8GB", "Storage": "128GB"},
    "variant_image": "url",
    "shop_name": "Shop Name",
    "shop_address": "Address",
    "batch_id": null,
    "is_delivered": false,
    "created_at": "2024-01-27T..."
  }
}
```

### Product API Response
```json
[
  {
    "id": "uuid",
    "name": "Product Name",
    "brand": "Brand",
    "model": "Model",
    "description": "Description",
    "price": 25000,
    "image": "url",
    ...
  }
]
```

---

## Accessing Nested Data in Zapier

### From Webhook (record object):
- `{{record__id}}` - Order ID
- `{{record__product_id}}` - Product ID
- `{{record__quantity}}` - Quantity
- `{{record__price}}` - Price
- `{{record__variants}}` - Variants (JSON)
- `{{record__shop_name}}` - Shop name
- `{{record__shop_address}}` - Shop address
- `{{record__batch_id}}` - Batch ID (null for Buy Now)

### From Product API (array response):
- `{{2__0__name}}` - Product name (Step 2, first item)
- `{{2__0__brand}}` - Brand
- `{{2__0__model}}` - Model
- `{{2__0__description}}` - Description

---

## Troubleshooting

### Webhook not triggering
- Check Supabase webhook logs (Database → Webhooks → View logs)
- Verify the webhook URL is correct
- Test by inserting a row manually

### Product details empty
- Check the GET request URL
- Verify anon key is correct
- Test the URL in browser: `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/products?id=eq.PRODUCT_ID&select=*&apikey=YOUR_KEY`

### Variants showing as JSON
- Use Formatter by Zapier to parse JSON
- Or display as-is: `{{record__variants}}`

### Getting errors about array index
- The product API returns an array
- Use `{{2__0__field}}` to access first item
- Or use `{{2__field}}` if Zapier auto-extracts

---

## For Checkout Orders (Separate Zap)

Create a second Zap with:
- Same webhook trigger
- **Filter**: `batch_id` (Text) `Exists`
- Fetch all orders with same batch_id
- Loop through and fetch each product
- Send one email with all products

This keeps Buy Now and Checkout emails separate and clean!
