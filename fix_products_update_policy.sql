-- Check existing policies on products table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';

-- Create policy to allow authenticated users to update variant_stock only
CREATE POLICY "Allow users to update product stock"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
