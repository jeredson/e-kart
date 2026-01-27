# Quick Reference: Zapier Data Variables for Orders

## Data Available in Zapier Trigger (New Row in orders table)

### Order Information
- `{{trigger.id}}` - Order ID (UUID)
- `{{trigger.batch_id}}` - Batch ID (null for Buy Now, UUID for Checkout)
- `{{trigger.created_at}}` - Order timestamp
- `{{trigger.is_delivered}}` - Delivery status (boolean)

### Product Information (from orders table)
- `{{trigger.product_id}}` - Product UUID (use this to fetch full product details)
- `{{trigger.quantity}}` - Quantity ordered
- `{{trigger.price}}` - Price per unit
- `{{trigger.variant_image}}` - Selected variant image URL
- `{{trigger.variants}}` - JSONB object with selected variants

### Shop Information
- `{{trigger.shop_name}}` - Shop name
- `{{trigger.shop_address}}` - Shop address

### User Information
- `{{trigger.user_id}}` - User UUID

---

## Fetching Product Details (Action: Find Record in products table)

Use `{{trigger.product_id}}` to search, then access:

- `{{product.name}}` - Product name
- `{{product.brand}}` - Brand name
- `{{product.model}}` - Model name
- `{{product.description}}` - Product description
- `{{product.image}}` - Main product image
- `{{product.price}}` - Base price
- `{{product.category_id}}` - Category UUID

---

## Parsing Variants (JSONB)

The `variants` field contains JSON like:
```json
{
  "Color": "Icy purple",
  "Ram": "8GB",
  "Storage": "128GB"
}
```

### Access in Zapier:
- `{{trigger.variants__Color}}` - Color value
- `{{trigger.variants__Ram}}` - RAM value
- `{{trigger.variants__Storage}}` - Storage value

### Or format as text:
Use **Formatter by Zapier** → **Text** → **Replace**
- Input: `{{trigger.variants}}`
- Find: `{|}|"|,`
- Replace with: ` `

---

## Calculating Subtotal

In Zapier, use **Formatter by Zapier** → **Numbers** → **Perform Math Operation**
- Input: `{{trigger.price}} * {{trigger.quantity}}`
- Output: Subtotal

Or in email template (if supported):
```
Subtotal: ₹{{trigger.price * trigger.quantity}}
```

---

## Filter Conditions

### For Buy Now Orders (Single Product)
```
Only continue if...
  batch_id (Text) Does not exist
```

### For Checkout Orders (Cart)
```
Only continue if...
  batch_id (Text) Exists
```

---

## Email Template Variables

### Buy Now Email
```
Subject: New Order: {{product.brand}} {{product.model}}

Product: {{product.name}}
Brand: {{product.brand}}
Model: {{product.model}}
Variants: Color: {{trigger.variants__Color}}, RAM: {{trigger.variants__Ram}}, Storage: {{trigger.variants__Storage}}
Quantity: {{trigger.quantity}}
Price: ₹{{trigger.price}}
Subtotal: ₹{{subtotal}}

Shop: {{trigger.shop_name}}
Address: {{trigger.shop_address}}

Order ID: {{trigger.id}}
Date: {{trigger.created_at}}
```

### Checkout Email (per product in batch)
Same as above, but group by `batch_id` first.

---

## Common Issues & Solutions

### Issue: Variants show as `[object Object]`
**Solution**: Use individual variant fields like `{{trigger.variants__Color}}`

### Issue: Product details are empty
**Solution**: Add "Find Record" action to fetch from products table using `{{trigger.product_id}}`

### Issue: Price shows with many decimals
**Solution**: Use Formatter → Numbers → Format Number → Set decimal places to 2

### Issue: Date format is ugly
**Solution**: Use Formatter → Date/Time → Format → Choose your preferred format

---

## Testing Your Zap

1. **Test Buy Now**: Place order with "Buy Now" button
   - Check: `batch_id` should be null
   - Check: Single product details appear
   
2. **Test Checkout**: Add 2+ items to cart and checkout
   - Check: All orders have same `batch_id`
   - Check: All products appear in email

3. **Check Zapier Task History**:
   - Go to Zapier Dashboard
   - Click on your Zap
   - Click "Task History"
   - Review successful/failed tasks
   - Check data received in trigger
