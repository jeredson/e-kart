-- Check existing RLS policies on orders table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders';

-- Drop old policies that might be blocking updates
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;

-- Create policy to allow users to update their own orders (for canceling)
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'orders';
