-- DEBUG: Check Brand-Product Linking
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check all brands
SELECT 
  id,
  name,
  logo,
  display_order
FROM brands
ORDER BY display_order;

-- 2. Check all products with their brand info
SELECT 
  p.id,
  p.name as product_name,
  p.brand as brand_text,
  p.brand_id,
  b.name as linked_brand_name
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
ORDER BY p.brand, p.name;

-- 3. Check products for specific brand (e.g., iPhone)
SELECT 
  p.id,
  p.name as product_name,
  p.brand as brand_text,
  p.brand_id,
  b.name as linked_brand_name
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
WHERE LOWER(p.brand) = 'iphone'
   OR LOWER(b.name) = 'iphone';

-- 4. Check if brand exists
SELECT * FROM brands WHERE LOWER(name) = 'iphone';

-- 5. Count products per brand
SELECT 
  b.name as brand_name,
  COUNT(p.id) as product_count
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
GROUP BY b.id, b.name
ORDER BY product_count DESC, b.name;

-- 6. Find products without brand_id
SELECT 
  id,
  name,
  brand
FROM products
WHERE brand IS NOT NULL
  AND brand != ''
  AND brand_id IS NULL;

-- 7. Check for case mismatches
SELECT DISTINCT
  p.brand as product_brand,
  b.name as brand_name,
  CASE 
    WHEN LOWER(p.brand) = LOWER(b.name) THEN 'MATCH'
    ELSE 'NO MATCH'
  END as match_status
FROM products p
CROSS JOIN brands b
WHERE p.brand IS NOT NULL
ORDER BY p.brand, b.name;
