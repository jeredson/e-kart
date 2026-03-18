# Quick Setup - Auto-Link Products to Brands

## What You Need to Do

### 1. Run This SQL Script ✅
File: `auto_link_products_to_brands.sql`

**Where:** Supabase Dashboard → SQL Editor

**What it does:**
- Links all existing products to brands (case-insensitive)
- Creates triggers for automatic linking of new products
- Creates missing brands automatically

### 2. That's It! ✅

After running the script:
- ✅ All products automatically linked to brands
- ✅ New products auto-link when added
- ✅ Case-insensitive: "iPhone" = "IPHONE" = "iphone"
- ✅ Missing brands created automatically

## Examples

### Before Running Script
```
Product: iPhone 15 Pro
Brand field: "iPhone"
Brand ID: NULL ❌
```

### After Running Script
```
Product: iPhone 15 Pro
Brand field: "iPhone"
Brand ID: [linked to "iphone" brand] ✅
```

### Adding New Product
```
1. Add product with brand: "SAMSUNG"
2. Automatically links to "Samsung" brand ✅
3. If "Samsung" brand doesn't exist, creates it ✅
```

## Verification

Run this in SQL Editor to check:
```sql
-- See products grouped by brand
SELECT 
  b.name as brand_name,
  COUNT(p.id) as product_count
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
GROUP BY b.id, b.name
ORDER BY product_count DESC;
```

## Result

- Homepage shows brands with correct product counts
- Clicking brand shows all products from that brand
- Case-insensitive matching works perfectly
- No manual linking needed ever again!

🚀 **Run the SQL script now and you're done!**
