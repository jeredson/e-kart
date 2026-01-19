-- Add DELETE policies for orders table

-- Allow users to delete their own orders
CREATE POLICY "Users can delete their own orders"
ON orders FOR DELETE
USING (auth.uid() = user_id);

-- Allow admins to delete all orders
CREATE POLICY "Admins can delete all orders"
ON orders FOR DELETE
USING (public.is_admin_user() = true);
