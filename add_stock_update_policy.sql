-- Create policy to allow authenticated users to update product stock
CREATE POLICY "Allow users to update product stock"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
