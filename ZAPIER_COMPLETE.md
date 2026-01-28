# COMPLETE ZAPIER SETUP - FROM SCRATCH

## Step 1: Trigger
1. **Webhooks by Zapier** → **Catch Hook**
2. Copy webhook URL
3. Update `FINAL_WEBHOOK.sql` with your webhook URL
4. Run SQL in Supabase
5. Place a test order to get sample data

## Step 2: Code Action
1. **Code by Zapier** → **Run JavaScript**
2. **LEAVE INPUT DATA EMPTY**
3. Paste code below:

```javascript
// Access webhook data directly
const batch_id = inputData.batch_id || '';
const shop_name = inputData.shop_name || '';
const shop_address = inputData.shop_address || '';
const created_at = inputData.created_at || '';

// Parse products array
let products = [];
const productsRaw = inputData.products;

if (typeof productsRaw === 'string') {
  try {
    products = JSON.parse(productsRaw);
  } catch (e) {
    products = [];
  }
} else if (Array.isArray(productsRaw)) {
  products = productsRaw;
}

// Format date: dd/mm/yyyy hour:minute
const d = new Date(created_at);
const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

// Build product details
const productNames = [];
const productVariants = [];
const quantities = [];
const unitPrices = [];
const subtotals = [];
let total = 0;

products.forEach(p => {
  // Product name
  productNames.push(p.name);
  
  // Variants formatted as: color:black ; ram:4GB ; storage:128GB
  const vars = p.variants || {};
  const variantStr = Object.entries(vars)
    .map(([k, v]) => `${k.toLowerCase()}:${v}`)
    .join(' ; ');
  productVariants.push(variantStr || 'N/A');
  
  // Quantity, price, subtotal
  quantities.push(p.quantity);
  unitPrices.push(p.price);
  const sub = p.quantity * p.price;
  subtotals.push(sub);
  total += sub;
});

// Format output
output = {
  batch_id: batch_id,
  shop_name: shop_name,
  shop_address: shop_address,
  date: date,
  product_names: productNames.join(', '),
  product_variants: productVariants.join(', '),
  quantities: quantities.join(', '),
  unit_prices: unitPrices.join(', '),
  subtotals: subtotals.join(', '),
  total: total
};
```

## Step 3: Send Message
**Gmail/Telegram/Slack** → Use these fields:

```
Batch ID: {{2__batch_id}}
Shop Name: {{2__shop_name}}
Shop Address: {{2__shop_address}}
Date: {{2__date}}
Products: {{2__product_names}}
Variants: {{2__product_variants}}
Quantities: {{2__quantities}}
Unit Prices: {{2__unit_prices}}
Subtotals: {{2__subtotals}}
Total: {{2__total}}
```

## Output Format Example:
```
Batch ID: 6c7b2244-a494-4605-b4e7-900884a20d65
Shop Name: Chennai Mobiles
Shop Address: Chennai
Date: 28/01/2026 13:35
Products: OnePlus 15R 5G, Oppo A59 5G
Variants: color:black ; ram:8GB, color:gold ; ram:12GB ; storage:256GB
Quantities: 2, 1
Unit Prices: 47999, 13994
Subtotals: 95998, 13994
Total: 109992
```
