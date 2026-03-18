# Troubleshooting: Products Not Showing for Brand

## Issue
Clicking on a brand (e.g., "iPhone") doesn't show products even though products exist.

## Quick Fix Steps

### Step 1: Run Auto-Link Script
If you haven't already, run this SQL in Supabase:

**File:** `auto_link_products_to_brands.sql`

This will:
- Link all products to brands automatically
- Create missing brands
- Fix case-insensitive matching

### Step 2: Verify Brand Name Matches

Run this SQL to check:
```sql
-- Check what brand name the product has
SELECT id, name, brand FROM products WHERE LOWER(name) LIKE '%iphone%';

-- Check what brands exist
SELECT id, name FROM brands WHERE LOWER(name) LIKE '%iphone%';
```

### Step 3: Check for Exact Match

The product's `brand` field must match the brand name (case-insensitive):

**Example:**
- Product brand: "iPhone" ✅
- Brand name: "iphone" ✅
- Match: YES (case-insensitive)

**Example:**
- Product brand: "Apple" ❌
- Brand name: "iPhone" ❌
- Match: NO (different names)

## Common Issues

### Issue 1: Brand Name Mismatch
**Problem:** Product has brand "Apple" but brand is named "iPhone"
**Solution:** Either:
- Change product brand to "iPhone", OR
- Change brand name to "Apple"

### Issue 2: Products Not Linked
**Problem:** Products have brand text but no brand_id
**Solution:** Run auto-link script:
```sql
-- See: auto_link_products_to_brands.sql
```

### Issue 3: Brand Doesn't Exist
**Problem:** Product has brand "iPhone" but no "iPhone" brand exists
**Solution:** 
1. Go to `/admin/brands`
2. Add "iPhone" brand
3. Products will auto-link

### Issue 4: Case Sensitivity
**Problem:** Product brand "IPHONE" doesn't match brand "iphone"
**Solution:** Already fixed! Matching is case-insensitive now.

## Debug Steps

### 1. Check Product Brand Field
```sql
SELECT id, name, brand, brand_id 
FROM products 
WHERE LOWER(name) LIKE '%iphone%';
```

Expected output:
```
id   | name          | brand  | brand_id
-----|---------------|--------|----------
123  | iPhone 15 Pro | iPhone | abc-def-...
```

### 2. Check Brand Exists
```sql
SELECT id, name 
FROM brands 
WHERE LOWER(name) = 'iphone';
```

Expected output:
```
id          | name
------------|-------
abc-def-... | iPhone
```

### 3. Check Products Are Linked
```sql
SELECT 
  p.name as product,
  p.brand as brand_text,
  b.name as linked_brand
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
WHERE LOWER(p.brand) = 'iphone';
```

Expected output:
```
product       | brand_text | linked_brand
--------------|------------|-------------
iPhone 15 Pro | iPhone     | iPhone
```

## Manual Fix

If auto-link doesn't work, manually link products:

```sql
-- 1. Get brand ID
SELECT id FROM brands WHERE LOWER(name) = 'iphone';
-- Copy the ID (e.g., 'abc-123-def')

-- 2. Link products to brand
UPDATE products 
SET brand_id = 'abc-123-def'  -- Paste brand ID here
WHERE LOWER(brand) = 'iphone';

-- 3. Verify
SELECT name, brand, brand_id 
FROM products 
WHERE LOWER(brand) = 'iphone';
```

## Testing

### Test 1: Check Homepage
1. Go to homepage
2. See "iPhone" brand card
3. Click it
4. Should see URL: `/?brand=iPhone`
5. Should see products

### Test 2: Check Brand Management
1. Go to `/admin/brands`
2. Find "iPhone" brand
3. Check product count column
4. Should show number > 0
5. Click eye icon
6. Should see products

### Test 3: Direct URL
1. Go to: `/?brand=iPhone`
2. Should see iPhone products
3. Title should say "iPhone Products"

## Expected Behavior

**When clicking iPhone brand:**
1. URL changes to `/?brand=iPhone`
2. Page shows "iPhone Products" title
3. Shows all products where `brand` field = "iPhone" (case-insensitive)
4. Product count shows correct number

## Still Not Working?

Run the debug SQL script:
**File:** `debug_brand_products.sql`

This will show:
- All brands
- All products with brand info
- Products for specific brand
- Products without brand_id
- Case mismatches

Then share the output to identify the issue.

## Quick Checklist

- [ ] Auto-link script run
- [ ] Brand exists in brands table
- [ ] Product has brand field filled
- [ ] Brand name matches product brand (case-insensitive)
- [ ] Product has brand_id set
- [ ] Clear browser cache
- [ ] Refresh page

## Summary

The fix ensures:
✅ Case-insensitive brand matching
✅ Products filter by brand name
✅ Dynamic title shows brand name
✅ Works with URL parameter

**Try clicking the brand again - it should work now!** 🚀
