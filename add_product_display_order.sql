-- Add display_order column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial order based on current order
UPDATE products SET display_order = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1
  FROM products p2
  WHERE p2.id = products.id
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
