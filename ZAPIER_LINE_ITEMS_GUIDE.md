# Zapier Setup - Line Items Format

## Your Situation

Your webhook is sending products as **Line Items** (separate fields like Products Brand, Products Model, etc.), not as a JSON array. This is actually easier to work with!

---

## Simple 3-Step Setup

### Step 1: Webhook Trigger
- Already done ✓
- You should see: Products Brand, Products Model, Products Quantity, etc.

### Step 2: Format Products List

1. Add action: **"Formatter by Zapier"**
2. Event: **"Utilities"** → **"Line-item to Text"**
3. Click "Continue"

**Configure:**
- **Input**: Select **"Products Product Name"** from webhook
- Click "Continue" and test

4. Add another **"Formatter by Zapier"**
5. Event: **"Text"** → **"Replace"**
6. Click "Continue"

**Configure:**
- **Input**: Output from previous formatter
- **Find**: `,` (comma)
- **Replace**: 
```
Product: 
```
- Click "Continue" and test

### Step 3: Send Email

1. Add action: **"Gmail"** or **"Email by Zapier"**
2. Event: **"Send Email"**

**Subject:**
```
New Order - [1. Shop Name]
```

**Body:**
```
🛒 NEW ORDER RECEIVED

📅 Order Date: [1. Order Date]
🔢 Batch ID: [1. Batch Id]

🏪 Shop Details:
Name: [1. Shop Name]
Address: [1. Shop Address]

📦 Products Ordered:

Product: [1. Products Product Name]
Variants: [1. Products Variants]
Quantity: [1. Products Quantity] × ₹[1. Products Unit Price] = ₹[1. Products Subtotal]

💰 TOTAL AMOUNT: ₹[1. Total Amount]
```

**Map fields from webhook (Step 1)**

---

## Better Method: Use Text Template

### Step 2 Alternative: Formatter Text

1. Add action: **"Formatter by Zapier"**
2. Event: **"Text"** → **"Default Value"**
3. Click "Continue"

**Configure:**
- **Input**: Leave blank
- **Default Value**: Build your template

**Template (map each field from webhook):**
```
Product: [Products Product Name]
Variants: [Products Variants]
Quantity: [Products Quantity] × ₹[Products Unit Price] = ₹[Products Subtotal]
```

Click inside and select each field from the dropdown:
- Products Product Name
- Products Variants  
- Products Quantity
- Products Unit Price
- Products Subtotal

This will automatically format all products with line breaks between them.

4. Use the output in your email

---

## Expected Email Output:

```
🛒 NEW ORDER RECEIVED

📅 Order Date: 28/01/2024
🔢 Batch ID: abc-123

🏪 Shop Details:
Name: Tech Store
Address: 123 Main Street

📦 Products Ordered:

Product: OnePlus 15R 5G
Variants: Color: Charcoal Black, Ram: 12GB, Storage: 256GB
Quantity: 2 × ₹47999 = ₹95998

Product: Oppo A59 5G
Variants: Color: Silk Gold, Ram: 4GB, Storage: 128GB
Quantity: 1 × ₹13994 = ₹13994

Product: boAt Rockerz 413
Variants: Color: Ash Grey
Quantity: 1 × ₹1499 = ₹1499

💰 TOTAL AMOUNT: ₹111491
```

---

## Why This Works

Zapier automatically handles line items (multiple products) when you use the fields directly. Each product will be formatted on its own line.

---

## Quick Test

1. Set up the formatter with the template
2. Test it
3. You should see all products formatted correctly
4. Use in email
5. Done!

No looping or code needed!
