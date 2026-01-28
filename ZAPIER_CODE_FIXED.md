# Zapier Code by Zapier - Fixed JavaScript

## Setup in Zapier:

1. After webhook trigger, add **"Code by Zapier"**
2. **Language**: JavaScript
3. **Input Data**: 
   - Click "+ Add Field"
   - Name: `products`
   - Value: In the dropdown, look for "1. Products" and select it
   - **IMPORTANT**: Make sure you select the actual Products field, not Products Product Name or other sub-fields
4. **Code**: Copy and paste below

## JavaScript Code:

```javascript
// Products comes as an array from webhook, access it directly
let products = inputData.products;
let productList = '';

if (products && Array.isArray(products)) {
  products.forEach(p => {
    productList += `Product: ${p.product_name}
Variants: ${p.variants}
Quantity: ${p.quantity} × ₹${p.unit_price} = ₹${p.subtotal}

`;
  });
} else {
  productList = 'No products found';
}

return {productList: productList};
```

## Use in Email:

In your Gmail/Email action, use: `{{output.productList}}`

## Output Format:

```
Product: OnePlus 15R 5G
Variants: Color: Charcoal Black, Ram: 12GB, Storage: 256GB
Quantity: 2 × ₹47999 = ₹95998

Product: Oppo A59 5G
Variants: Color: Silk Gold, Ram: 4GB, Storage: 128GB
Quantity: 1 × ₹13994 = ₹13994
```
