-- Check if orders table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'orders';

-- Drop and recreate orders table with correct structure
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete all orders" ON orders;
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  variants JSONB DEFAULT '{}',
  shop_name TEXT NOT NULL,
  shop_address TEXT NOT NULL,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
ON orders FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (public.is_admin_user() = true);

CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (public.is_admin_user() = true);

CREATE POLICY "Admins can delete all orders"
ON orders FOR DELETE
USING (public.is_admin_user() = true);

-- Verify table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';
