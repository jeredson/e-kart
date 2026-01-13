-- Add variant columns to cart_items table
DO $$ 
BEGIN
    -- Add variants column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'variants') THEN
        ALTER TABLE cart_items ADD COLUMN variants JSONB;
    END IF;
    
    -- Add variant_image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'variant_image') THEN
        ALTER TABLE cart_items ADD COLUMN variant_image TEXT;
    END IF;
END $$;

-- Update the unique constraint to include variants
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'cart_items_user_product_unique') THEN
        ALTER TABLE cart_items DROP CONSTRAINT cart_items_user_product_unique;
    END IF;
    
    -- Add new constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'cart_items_user_product_variant_unique') THEN
        ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_product_variant_unique 
        UNIQUE (user_id, product_id, variants);
    END IF;
END $$;