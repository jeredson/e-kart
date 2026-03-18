-- CREATE BRANDS TABLE AND UPDATE PRODUCTS
-- Run this in Supabase SQL Editor

-- 1. Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add brand_id to products table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id') THEN
        ALTER TABLE products ADD COLUMN brand_id UUID REFERENCES brands(id);
    END IF;
END $$;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_display_order ON brands(display_order);

-- 4. Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for brands
-- Allow everyone to read brands
CREATE POLICY "Anyone can view brands" ON brands
FOR SELECT TO authenticated, anon
USING (true);

-- Only admins can manage brands
CREATE POLICY "Admin can manage brands" ON brands
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- 6. Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert some sample brands based on existing products (optional)
INSERT INTO brands (name, display_order) 
SELECT DISTINCT brand, ROW_NUMBER() OVER (ORDER BY brand) - 1
FROM products 
WHERE brand IS NOT NULL AND brand != ''
ON CONFLICT (name) DO NOTHING;

-- 8. Update products to link with brands (optional)
UPDATE products 
SET brand_id = brands.id
FROM brands 
WHERE products.brand = brands.name
AND products.brand_id IS NULL;

-- 9. Verify the setup
SELECT 'Brands created:' as info, COUNT(*) as count FROM brands;
SELECT 'Products with brand_id:' as info, COUNT(*) as count FROM products WHERE brand_id IS NOT NULL;