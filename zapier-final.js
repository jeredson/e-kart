// ZAPIER JAVASCRIPT - Leave Input Data Empty

const batch_id = inputData.batch_id || '';
const shop_name = inputData.shop_name || '';
const shop_address = inputData.shop_address || '';
const created_at = inputData.created_at || '';

// Parse products
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
  productNames.push(p.name);
  
  const vars = p.variants || {};
  const variantStr = Object.entries(vars)
    .map(([k, v]) => `${k.toLowerCase()}:${v}`)
    .join(' ; ');
  productVariants.push(variantStr || 'N/A');
  
  quantities.push(p.quantity);
  unitPrices.push(p.price);
  const sub = p.quantity * p.price;
  subtotals.push(sub);
  total += sub;
});

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
