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

-- Remove all existing unique constraints that might conflict
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find and drop all unique constraints on cart_items that involve user_id and product_id
    FOR constraint_name IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'cart_items' 
        AND tc.constraint_type = 'UNIQUE'
        AND kcu.column_name IN ('user_id', 'product_id')
    LOOP
        EXECUTE 'ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
    
    -- Add the new constraint
    ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_product_variant_unique 
    UNIQUE (user_id, product_id, variants);
END $$;