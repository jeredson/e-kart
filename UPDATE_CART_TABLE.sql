-- Add variant columns to cart_items table
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS variants JSONB,
ADD COLUMN IF NOT EXISTS variant_image TEXT;

-- Update the unique constraint to include variants
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_product_unique;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_product_variant_unique 
UNIQUE (user_id, product_id, variants);