-- Update existing orders to use product default image where variant_image is null
UPDATE orders o
SET variant_image = p.image
FROM products p
WHERE o.product_id = p.id AND o.variant_image IS NULL;
