// ZAPIER CODE - Map each field in Input Data section

const batch_id = inputData.batch_id;
const shop_name = inputData.shop_name;
const shop_address = inputData.shop_address;
const created_at = inputData.created_at;

// Debug: log what we receive
console.log('Products type:', typeof inputData.products);
console.log('Products value:', inputData.products);

// Parse products - Zapier may send as string or array
let products = [];
if (typeof inputData.products === 'string') {
  try {
    products = JSON.parse(inputData.products);
  } catch (e) {
    console.log('Parse error:', e);
  }
} else if (Array.isArray(inputData.products)) {
  products = inputData.products;
}

const d = new Date(created_at);
const orderDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

let productsText = '';
let total = 0;

products.forEach(p => {
  const variantsText = p.variants && Object.keys(p.variants).length > 0
    ? Object.entries(p.variants).map(([k, v]) => `${k}: ${v}`).join(', ')
    : '';
  
  const subtotal = p.quantity * p.price;
  total += subtotal;
  
  productsText += `Product: ${p.name}\n`;
  if (variantsText) productsText += `Variants: ${variantsText}\n`;
  productsText += `Quantity: ${p.quantity} × ₹${p.price.toLocaleString('en-IN')} = ₹${subtotal.toLocaleString('en-IN')}\n\n`;
});

output = {
  message: `🛒 NEW ORDER\n\n📅 Date: ${orderDate}\n🔢 Batch ID: ${batch_id}\n\n📦 Products:\n---\n${productsText}Total: ₹${total.toLocaleString('en-IN')}\n---\n\n🏪 Shop Details:\nName: ${shop_name}\nAddress: ${shop_address}`
};
