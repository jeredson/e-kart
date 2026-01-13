-- Debug and clean up cart_items table

-- 1. Check current cart items structure
SELECT 
    id,
    user_id,
    product_id,
    product_name,
    variants,
    variant_image,
    quantity,
    created_at
FROM cart_items 
ORDER BY created_at DESC
LIMIT 20;

-- 2. Find duplicate entries (same user, product, variants)
SELECT 
    user_id,
    product_id,
    variants,
    COUNT(*) as count
FROM cart_items 
GROUP BY user_id, product_id, variants
HAVING COUNT(*) > 1;

-- 3. Clean up any duplicate entries (keep the most recent one)
DELETE FROM cart_items 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, product_id, variants) id
    FROM cart_items 
    ORDER BY user_id, product_id, variants, created_at DESC
);

-- 4. Verify the unique constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'cart_items' 
AND constraint_type = 'UNIQUE';