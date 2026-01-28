# Complete Guide: Order Confirmation Emails with Zapier

## What You'll Get

Beautiful formatted emails like this:

```
🛒 NEW ORDER

📅 Date: 28/01/2026
🔢 Batch ID: 0bc705b7-f5d1-4741-9c20-dbcb13227a95

📦 Products:
---
Product: OnePlus 15R 5G
Variants: Color: Charcoal Black
Quantity: 2 × ₹47999 = ₹95998

Product: Oppo A59 5G
Variants: Ram: 12GB
Quantity: 1 × ₹13994 = ₹13994

Total: ₹111491
---

🏪 Shop Details:
Name: Chennai Mobiles
Address: Chennai
```

---

## Step 1: Create Zapier Webhook

1. Go to [zapier.com](https://zapier.com)
2. Click **Create Zap**
3. Name it: "Order Confirmation Emails"
4. Search **"Webhooks by Zapier"**
5. Choose **"Catch Hook"**
6. Click **Continue**
7. **COPY THE WEBHOOK URL**

---

## Step 2: Update Your Code

### Already Done! ✅
Your code already sends to: `https://hooks.zapier.com/hooks/catch/26132431/uqvigh0/`

Both **Checkout** and **Buy Now** send order data to Zapier.

---

## Step 3: Test the Webhook

1. Place a test order (use Checkout or Buy Now)
2. Go back to Zapier
3. Click **"Test trigger"**
4. You should see order data
5. Click **Continue**

---

## Step 4: Add JavaScript Code to Format Products

1. Click **+** to add action
2. Search **"Code by Zapier"**
3. Choose **"Run JavaScript"**
4. Click **Continue**

### Configure JavaScript:

**Input Data:**
- `orders`: (Select from webhook) → orders
- `user_id`: (Select from webhook) → user_id
- `shop_name`: (Select from webhook) → shop_name
- `shop_address`: (Select from webhook) → shop_address
- `total_amount`: (Select from webhook) → total_amount
- `batch_id`: (Select from webhook) → batch_id (or leave empty for Buy Now)
- `ordered_at`: (Select from webhook) → ordered_at

**Code:**
```javascript
// Parse orders if it's a string
let ordersList = inputData.orders;
if (typeof ordersList === 'string') {
  ordersList = JSON.parse(ordersList);
}

// Format date
const orderDate = new Date(inputData.ordered_at);
const formattedDate = orderDate.toLocaleDateString('en-GB');

// Build products list
let productsList = '';
let totalAmount = 0;

for (let i = 0; i < ordersList.length; i++) {
  const order = ordersList[i];
  
  // We'll fetch product name in next step, for now use product_id
  productsList += `\nProduct ID: ${order.product_id}\n`;
  
  // Format variants
  if (order.variants && Object.keys(order.variants).length > 0) {
    const variantStr = Object.entries(order.variants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    productsList += `Variants: ${variantStr}\n`;
  }
  
  // Calculate line total
  const lineTotal = order.quantity * order.price;
  totalAmount += lineTotal;
  
  productsList += `Quantity: ${order.quantity} × ₹${order.price.toLocaleString('en-IN')} = ₹${lineTotal.toLocaleString('en-IN')}\n`;
  
  if (i < ordersList.length - 1) {
    productsList += '\n';
  }
}

// Output
output = {
  formatted_date: formattedDate,
  products_list: productsList,
  total_amount: totalAmount,
  batch_id: inputData.batch_id || 'N/A',
  shop_name: inputData.shop_name,
  shop_address: inputData.shop_address,
  product_ids: ordersList.map(o => o.product_id).join(',')
};
```

5. Click **Continue**
6. Click **Test action**
7. Click **Continue**

---

## Step 5: Get Product Names (Loop)

Since we have multiple products, we need to fetch each product name.

1. Click **+** to add action
2. Search **"Looping by Zapier"**
3. Choose **"Create Loop from Line Items"**
4. Click **Continue**

**Configure:**
- **Values:** (Select from JavaScript step) → product_ids

5. Click **Continue**
6. Click **Test action**
7. Click **Continue**

---

## Step 6: Get Product Details in Loop

1. Click **+** to add action
2. Search **"Webhooks by Zapier"**
3. Choose **GET**
4. Click **Continue**

**Configure:**
- **URL:** `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/products?id=eq.{{value}}&select=name,brand,model`
  - `{{value}}` comes from the Loop step
- **Headers:**
  - Key: `apikey` | Value: Your Supabase anon key
  - Key: `Authorization` | Value: `Bearer YOUR_SUPABASE_ANON_KEY`

5. Click **Continue**
6. Click **Test action**
7. Click **Continue**

---

## Step 7: Format Products with Names (JavaScript)

1. Click **+** to add action
2. Search **"Code by Zapier"**
3. Choose **"Run JavaScript"**
4. Click **Continue**

**Input Data:**
- `orders`: (Select from webhook) → orders
- `product_names`: (Select from Loop) → All product names (comma separated)

**Code:**
```javascript
// Parse orders
let ordersList = inputData.orders;
if (typeof ordersList === 'string') {
  ordersList = JSON.parse(ordersList);
}

// Parse product names (comes from loop as comma-separated)
const productNames = inputData.product_names.split(',');

// Build formatted products list
let productsList = '';
let totalAmount = 0;

for (let i = 0; i < ordersList.length; i++) {
  const order = ordersList[i];
  const productName = productNames[i] || 'Unknown Product';
  
  productsList += `Product: ${productName}\n`;
  
  // Format variants
  if (order.variants && Object.keys(order.variants).length > 0) {
    const variantStr = Object.entries(order.variants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    productsList += `Variants: ${variantStr}\n`;
  }
  
  // Calculate line total
  const lineTotal = order.quantity * order.price;
  totalAmount += lineTotal;
  
  productsList += `Quantity: ${order.quantity} × ₹${order.price.toLocaleString('en-IN')} = ₹${lineTotal.toLocaleString('en-IN')}\n`;
  
  if (i < ordersList.length - 1) {
    productsList += '\n';
  }
}

output = {
  products_formatted: productsList,
  total_amount: totalAmount
};
```

5. Click **Continue**
6. Click **Test action**
7. Click **Continue**

---

## Step 8: Get User Email

1. Click **+** to add action
2. Search **"Webhooks by Zapier"**
3. Choose **GET**

**Configure:**
- **URL:** `https://aqcmmfeimioxvcpwpafr.supabase.co/rest/v1/user_profiles?id=eq.{{user_id}}&select=email,first_name,last_name`
- **Headers:**
  - Key: `apikey` | Value: Your Supabase anon key
  - Key: `Authorization` | Value: `Bearer YOUR_SUPABASE_ANON_KEY`

4. Click **Continue** → **Test** → **Continue**

---

## Step 9: Send Email to Customer

1. Click **+** to add action
2. Search **"Gmail"**
3. Choose **"Send Email"**
4. Connect Gmail

**Configure:**
- **To:** `{{email__0}}`
- **Subject:** `Order Confirmed - Agnes Mobiles - B2B`
- **Body:**
```
Hello {{first_name__0}},

🛒 NEW ORDER

📅 Date: {{formatted_date}}
🔢 Order ID: {{batch_id}}

📦 Products:
---
{{products_formatted}}

Total: ₹{{total_amount}}
---

🏪 Shop Details:
Name: {{shop_name}}
Address: {{shop_address}}

Your order has been received and is being processed.
We'll notify you when it's ready for delivery.

Best regards,
Agnes Mobiles - B2B Team
```

5. Click **Continue** → **Test** → **Continue**

---

## Step 10: Send Email to Admin

1. Click **+** to add action
2. Search **"Gmail"**
3. Choose **"Send Email"**

**Configure:**
- **To:** `your-admin-email@gmail.com`
- **Subject:** `New Order - {{shop_name}} - ₹{{total_amount}}`
- **Body:**
```
🛒 NEW ORDER

📅 Date: {{formatted_date}}
🔢 Batch ID: {{batch_id}}

👤 Customer Details:
---
Name: {{first_name__0}} {{last_name__0}}
Email: {{email__0}}
Shop: {{shop_name}}
Address: {{shop_address}}
---

📦 Products:
---
{{products_formatted}}

Total: ₹{{total_amount}}
---

View in Admin Panel:
https://your-domain.com/admin/orders

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agnes Mobiles - B2B System
```

4. Click **Continue** → **Test** → **Continue**

---

## Step 11: Publish & Test

1. Click **Publish**
2. Turn on the Zap
3. Place test orders:
   - Single product (Buy Now)
   - Multiple products (Checkout)
4. Check emails
5. ✅ Done!

---

## Simplified Alternative (Without Product Names)

If the above is too complex, use this simpler JavaScript:

```javascript
let ordersList = inputData.orders;
if (typeof ordersList === 'string') {
  ordersList = JSON.parse(ordersList);
}

const orderDate = new Date(inputData.ordered_at);
const formattedDate = orderDate.toLocaleDateString('en-GB');

let productsList = '';
let totalAmount = 0;

for (let i = 0; i < ordersList.length; i++) {
  const order = ordersList[i];
  
  productsList += `Product ID: ${order.product_id}\n`;
  
  if (order.variants && Object.keys(order.variants).length > 0) {
    const variantStr = Object.entries(order.variants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    productsList += `Variants: ${variantStr}\n`;
  }
  
  const lineTotal = order.quantity * order.price;
  totalAmount += lineTotal;
  
  productsList += `Quantity: ${order.quantity} × ₹${order.price.toLocaleString('en-IN')} = ₹${lineTotal.toLocaleString('en-IN')}\n\n`;
}

output = {
  formatted_date: formattedDate,
  products_list: productsList,
  total_amount: totalAmount,
  batch_id: inputData.batch_id || 'Single Order'
};
```

Then skip the Loop steps and go straight to sending emails.

---

## Summary

**Your Zap Flow:**
```
1. Webhook (Catch order data)
   ↓
2. JavaScript (Format products)
   ↓
3. Loop (Get each product ID)
   ↓
4. GET (Fetch product names)
   ↓
5. JavaScript (Build final format)
   ↓
6. GET (Fetch user email)
   ↓
7. Gmail (Send to customer)
   ↓
8. Gmail (Send to admin)
```

**Works for:**
- ✅ Single product (Buy Now)
- ✅ Multiple products (Checkout)
- ✅ Beautiful formatted emails
- ✅ Product names, variants, quantities
- ✅ Proper totals

🎉 **All done!**
