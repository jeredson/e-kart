# Zapier - Format Line Items into Separate Products

## The Problem
Zapier is receiving products as comma-separated line items, and we need to format them as separate product blocks.

---

## Solution: Use Code by Zapier

### Step 1: Webhook Trigger
Already done ✓

### Step 2: Add Code by Zapier

1. Add action: **"Code by Zapier"**
2. **Language**: JavaScript
3. Click "Continue"

### Step 3: Configure Input Data

Click **"+ Add Field"** for each:

| Name | Value (select from webhook) |
|------|----------------------------|
| `product_names` | Products Product Name |
| `variants` | Products Variants |
| `quantities` | Products Quantity |
| `unit_prices` | Products Unit Price |
| `subtotals` | Products Subtotal |

### Step 4: Add Code

```javascript
// Split comma-separated values into arrays
let names = inputData.product_names.split(',');
let variants = inputData.variants.split(',');
let quantities = inputData.quantities.split(',');
let prices = inputData.unit_prices.split(',');
let subtotals = inputData.subtotals.split(',');

let productList = '';

// Loop through each product
for (let i = 0; i < names.length; i++) {
  productList += `Product: ${names[i].trim()}
Variants: ${variants[i].trim()}
Quantity: ${quantities[i].trim()} × ₹${prices[i].trim()} = ₹${subtotals[i].trim()}

`;
}

return {productList: productList};
```

### Step 5: Test
Click "Test action" - you should see formatted products

### Step 6: Send Email

1. Add action: **"Gmail"** or **"Email by Zapier"**
2. **Subject**: `New Order - [Shop Name from webhook]`
3. **Body**:

```
🛒 NEW ORDER

📅 Date: [Order Date from webhook]
🔢 Batch ID: [Batch Id from webhook]

🏪 Shop Details:
Name: [Shop Name from webhook]
Address: [Shop Address from webhook]

📦 Products:
[Product List from Code output]

💰 Total: ₹[Total Amount from webhook]
```

**Map fields:**
- Order Date → From webhook (Step 1)
- Batch Id → From webhook (Step 1)
- Shop Name → From webhook (Step 1)
- Shop Address → From webhook (Step 1)
- Product List → From Code output (Step 2) - select "Product List"
- Total Amount → From webhook (Step 1)

### Step 7: Turn On Zap
Click "Publish"

---

## Expected Output:

```
🛒 NEW ORDER

📅 Date: 28/01/2026
🔢 Batch ID: 0bc705b7-f5d1-4741-9c20-dbcb13227a95

🏪 Shop Details:
Name: Chennai Mobiles
Address: Chennai

📦 Products:
Product: OnePlus 15R 5G
Variants: Color: Charcoal Black, Ram: 12GB, Storage: 256GB
Quantity: 2 × ₹47999 = ₹95998

Product: Oppo A59 5G
Variants: Color: Silk Gold, Ram: 4GB, Storage: 128GB
Quantity: 1 × ₹13994 = ₹13994

Product: boAt Rockerz 413
Variants: Color: Ash Grey
Quantity: 1 × ₹1499 = ₹1499

💰 Total: ₹111491
```

---

## Troubleshooting

**Error: Cannot read property 'split'**
- Make sure all 5 input fields are mapped correctly
- Check that you selected the right fields from webhook

**Products not separating**
- Verify the code is exactly as shown
- Check that line breaks are preserved in the code

**Missing products**
- All products should have the same number of comma-separated values
- Check webhook test data

---

## Summary

This solution:
1. Takes comma-separated line items from webhook
2. Splits them into arrays
3. Loops through and formats each product
4. Returns formatted text for email

Simple and works every time!
