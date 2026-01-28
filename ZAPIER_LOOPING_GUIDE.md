# Step-by-Step: Format Products Array in Zapier Email

## Method: Using Looping by Zapier to Build Product List

This guide shows how to loop through the products array and format it nicely in a single email.

---

## Step 1: Set Up Webhook Trigger (2 minutes)

1. Create new Zap in Zapier
2. **Trigger**: "Webhooks by Zapier"
3. **Event**: "Catch Hook"
4. Click "Continue"
5. **Copy the webhook URL** (e.g., `https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX/`)
6. Place a test order in your app
7. Click "Test trigger" - you should see the data with `products` array

---

## Step 2: Add Looping by Zapier (3 minutes)

1. Click **"+"** to add an action
2. Search for **"Looping by Zapier"**
3. **Event**: "Create Loop From Line Items"
4. Click "Continue"

### Configure Loop:
- **Input**: Click the field and select `Products` from the webhook data
- This will show as `1. Products` in the dropdown

5. Click "Continue"
6. Click "Test action"
7. You should see it found multiple items (or 1 item for single product)

---

## Step 3: Format Each Product (2 minutes)

1. Click **"+"** to add another action
2. Search for **"Formatter by Zapier"**
3. **Event**: "Text" → "Default Value"
4. Click "Continue"

### Configure Formatter:
- **Input**: Leave empty or put a space
- **Default Value**: Build your product format using fields from Loop

**In the Default Value field, type:**
```
Product: [Product Name from Loop]
Variants: [Variants from Loop]
Quantity: [Quantity from Loop] × ₹[Unit Price from Loop] = ₹[Subtotal from Loop]

```

**Important:** 
- Click inside the field and select each value from the Loop output dropdown
- Add line breaks after each line
- Add an extra blank line at the end for spacing between products

5. Click "Continue"
6. Click "Test action"
7. You should see one formatted product

---

## Step 4: Append to Storage (2 minutes)

1. Click **"+"** to add another action
2. Search for **"Storage by Zapier"**
3. **Event**: "Append Value"
4. Click "Continue"

### Configure Storage:
- **Key**: `products_list`
- **Value**: Select the formatted text from Step 3
- **Create if doesn't exist**: Yes

5. Click "Continue"
6. Click "Test action"

---

## Step 5: Get Complete Product List (1 minute)

1. Click **"+"** to add another action (AFTER the loop)
2. Search for **"Storage by Zapier"**
3. **Event**: "Get Value"
4. Click "Continue"

### Configure:
- **Key**: `products_list`

5. Click "Continue"
6. Click "Test action"
7. You should see all products formatted together

---

## Step 6: Send Email (3 minutes)

1. Click **"+"** to add another action
2. Search for **"Gmail"** or **"Email by Zapier"**
3. **Event**: "Send Email"
4. Click "Continue"
5. Connect your email account

### Configure Email:

**To**: `your-admin@email.com`

**Subject**: 
```
New Order - {{shop_name}}
```
Map `shop_name` from the webhook (Step 1)

**Body**:
```
🛒 NEW ORDER RECEIVED

📅 Order Date: {{order_date}}
🔢 Batch ID: {{batch_id}}

🏪 Shop Details:
Name: {{shop_name}}
Address: {{shop_address}}

📦 Products Ordered:
{{products_list}}

💰 TOTAL AMOUNT: ₹{{total_amount}}
```

**Map these fields:**
- `{{order_date}}` → From webhook (Step 1)
- `{{batch_id}}` → From webhook (Step 1)
- `{{shop_name}}` → From webhook (Step 1)
- `{{shop_address}}` → From webhook (Step 1)
- `{{products_list}}` → From Storage Get Value (Step 5)
- `{{total_amount}}` → From webhook (Step 1)

6. Click "Continue"
7. Click "Test action"
8. Check your email!

---

## Step 7: Clear Storage (1 minute)

1. Click **"+"** to add final action
2. Search for **"Storage by Zapier"**
3. **Event**: "Delete Value"
4. Click "Continue"

### Configure:
- **Key**: `products_list`

5. Click "Continue"
6. Click "Test action"

---

## Step 8: Turn On Zap

1. Click **"Publish"** or **"Turn On Zap"**
2. Place a test order
3. Check your email!

---

## Zap Flow Summary

```
1. Webhooks by Zapier (Catch Hook)
   ↓
2. Looping by Zapier (Loop through products array)
   ↓
3. Formatter by Zapier (Format each product)
   ↓
4. Storage by Zapier (Append formatted product)
   ↓
   [Loop ends, continues to next step]
   ↓
5. Storage by Zapier (Get all products)
   ↓
6. Gmail/Email (Send email with all products)
   ↓
7. Storage by Zapier (Clear storage for next order)
```

---

## Alternative: Simpler Method (No Loop)

If you want a simpler setup without looping:

### Use Code by Zapier:

1. After webhook trigger, add **"Code by Zapier"**
2. **Language**: JavaScript
3. **Code**:
```javascript
let productsJson = inputData.products;
let products = JSON.parse(productsJson);
let productList = '';

products.forEach(p => {
  productList += `Product: ${p.product_name}
Variants: ${p.variants}
Quantity: ${p.quantity} × ₹${p.unit_price} = ₹${p.subtotal}

`;
});

return {productList: productList};
```
4. **Input Data**: 
   - `products` → Select "Products" from webhook (the raw JSON string)

5. Use `output.productList` in your email

---

## Troubleshooting

**Loop not working?**
- Ensure products is an array in webhook test
- Check that you selected the correct field

**Products not showing in email?**
- Verify Storage Get Value is AFTER the loop
- Check Storage key matches exactly

**Email sending multiple times?**
- Make sure email action is OUTSIDE the loop
- It should be after "Get Value" step

---

## Files
- `zapier_products_array_fixed.sql` - Database setup
- This guide - Zapier configuration
