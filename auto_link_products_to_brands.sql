-- AUTO-LINK PRODUCTS TO BRANDS (CASE-INSENSITIVE)
-- Run this in Supabase SQL Editor

-- 1. Create function to auto-link product to brand
CREATE OR REPLACE FUNCTION auto_link_product_to_brand()
RETURNS TRIGGER AS $$
DECLARE
  brand_uuid UUID;
BEGIN
  -- Only proceed if product has a brand name
  IF NEW.brand IS NOT NULL AND NEW.brand != '' THEN
    -- Find matching brand (case-insensitive)
    SELECT id INTO brand_uuid
    FROM brands
    WHERE LOWER(name) = LOWER(NEW.brand)
    LIMIT 1;
    
    -- If brand found, link it
    IF brand_uuid IS NOT NULL THEN
      NEW.brand_id = brand_uuid;
    ELSE
      -- Optionally create brand if it doesn't exist
      INSERT INTO brands (name, display_order)
      VALUES (NEW.brand, (SELECT COALESCE(MAX(display_order), -1) + 1 FROM brands))
      RETURNING id INTO brand_uuid;
      
      NEW.brand_id = brand_uuid;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger for new products
DROP TRIGGER IF EXISTS auto_link_brand_on_insert ON products;
CREATE TRIGGER auto_link_brand_on_insert
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_product_to_brand();

-- 3. Create trigger for updated products
DROP TRIGGER IF EXISTS auto_link_brand_on_update ON products;
CREATE TRIGGER auto_link_brand_on_update
  BEFORE UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.brand IS DISTINCT FROM NEW.brand)
  EXECUTE FUNCTION auto_link_product_to_brand();

-- 4. Update all existing products to link with brands (case-insensitive)
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE LOWER(p.brand) = LOWER(b.name)
AND p.brand_id IS NULL;

-- 5. Create brands for products that don't have a matching brand yet
INSERT INTO brands (name, display_order)
SELECT DISTINCT 
  p.brand,
  ROW_NUMBER() OVER (ORDER BY p.brand) + (SELECT COALESCE(MAX(display_order), -1) FROM brands)
FROM products p
WHERE p.brand IS NOT NULL 
  AND p.brand != ''
  AND NOT EXISTS (
    SELECT 1 FROM brands b 
    WHERE LOWER(b.name) = LOWER(p.brand)
  )
ON CONFLICT (name) DO NOTHING;

-- 6. Link the newly created brands
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE LOWER(p.brand) = LOWER(b.name)
AND p.brand_id IS NULL;

-- 7. Verify the results
SELECT 
  'Total products' as info, 
  COUNT(*) as count 
FROM products;

SELECT 
  'Products with brand_id' as info, 
  COUNT(*) as count 
FROM products 
WHERE brand_id IS NOT NULL;

SELECT 
  'Products without brand_id' as info, 
  COUNT(*) as count 
FROM products 
WHERE brand_id IS NULL;

SELECT 
  'Total brands' as info, 
  COUNT(*) as count 
FROM brands;

-- 8. Show products grouped by brand
SELECT 
  b.name as brand_name,
  COUNT(p.id) as product_count
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
GROUP BY b.id, b.name
ORDER BY product_count DESC, b.name;
