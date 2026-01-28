// Zapier JavaScript Code - Paste in "Run JavaScript" action

const { batch_id, shop_name, shop_address, created_at, products } = inputData;

const date = new Date(created_at).toLocaleDateString('en-GB');
let text = '';
let total = 0;

products.forEach(p => {
  const vars = p.variants && Object.keys(p.variants).length > 0
    ? Object.entries(p.variants).map(([k, v]) => `${k}: ${v}`).join(', ')
    : '';
  
  const sub = p.quantity * p.price;
  total += sub;
  
  text += `Product: ${p.name}\n`;
  if (vars) text += `Variants: ${vars}\n`;
  text += `Quantity: ${p.quantity} × ₹${p.price.toLocaleString('en-IN')} = ₹${sub.toLocaleString('en-IN')}\n\n`;
});

output = {
  message: `🛒 NEW ORDER\n\n📅 Date: ${date}\n🔢 Batch ID: ${batch_id}\n\n📦 Products:\n---\n${text}Total: ₹${total.toLocaleString('en-IN')}\n---\n\n🏪 Shop Details:\nName: ${shop_name}\nAddress: ${shop_address}`
};
