-- COMPREHENSIVE FIX FOR ORDERS TABLE
-- Run this entire script in Supabase Dashboard -> SQL Editor

-- CRITICAL: Remove the problematic trigger first
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS notify_new_order();

-- Step 1: Ensure all columns exist with correct types
DO $$ 
BEGIN
    -- Add price column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'price') THEN
        ALTER TABLE orders ADD COLUMN price NUMERIC;
    END IF;
    
    -- Add variant_image column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'variant_image') THEN
        ALTER TABLE orders ADD COLUMN variant_image TEXT;
    END IF;
    
    -- Add batch_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'batch_id') THEN
        ALTER TABLE orders ADD COLUMN batch_id UUID;
    END IF;
    
    -- Add is_delivered column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'is_delivered') THEN
        ALTER TABLE orders ADD COLUMN is_delivered BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Step 2: Make price nullable (it was added as NOT NULL which causes issues)
ALTER TABLE orders ALTER COLUMN price DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN price SET DEFAULT 0;

-- Step 3: Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop and recreate RLS policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Create policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Step 5: Verify the setup
SELECT 
    'Column Check' as check_type,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Show RLS status
SELECT 
    'RLS Status' as check_type,
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'orders';

-- Show policies
SELECT 
    'Policies' as check_type,
    policyname,
    cmd as command,
    permissive
FROM pg_policies
WHERE tablename = 'orders';
