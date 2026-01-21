-- Ensure stock updates work properly

-- 1. Check if the update policy exists
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'products' AND cmd = 'UPDATE';

-- 2. Drop any conflicting policies
DROP POLICY IF EXISTS "Allow users to update product stock" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;

-- 3. Create a proper policy for stock updates
CREATE POLICY "Allow authenticated users to update product stock"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Verify the policy was created
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'products' AND cmd = 'UPDATE';
