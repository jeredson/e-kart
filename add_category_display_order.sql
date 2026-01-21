-- Add display_order column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial order based on current order
UPDATE categories SET display_order = (
  SELECT ROW_NUMBER() OVER (ORDER BY name) - 1
  FROM categories c2
  WHERE c2.id = categories.id
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
