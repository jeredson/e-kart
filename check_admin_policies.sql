-- CHECK AND FIX RLS POLICIES FOR ADMIN ACCESS
-- Run this in Supabase SQL Editor

-- 1. Check current RLS policies on products table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('products', 'categories', 'profiles')
ORDER BY tablename, policyname;

-- 2. Check if RLS is enabled on key tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('products', 'categories', 'profiles')
AND schemaname = 'public';

-- 3. Ensure admin can manage products (if needed)
-- This policy allows users with is_admin = true to do everything on products
DO $$
BEGIN
    -- Drop existing admin policy if it exists
    DROP POLICY IF EXISTS "Admin can manage products" ON products;
    
    -- Create comprehensive admin policy for products
    CREATE POLICY "Admin can manage products" ON products
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );
    
    RAISE NOTICE 'Created admin policy for products table';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating admin policy: %', SQLERRM;
END $$;

-- 4. Ensure admin can manage categories (if needed)
DO $$
BEGIN
    -- Drop existing admin policy if it exists
    DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
    
    -- Create comprehensive admin policy for categories
    CREATE POLICY "Admin can manage categories" ON categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );
    
    RAISE NOTICE 'Created admin policy for categories table';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating admin policy: %', SQLERRM;
END $$;

-- 5. Test admin access
SELECT 
    'Admin user check' as test,
    u.email,
    p.is_admin,
    CASE 
        WHEN p.is_admin = true THEN 'ADMIN ACCESS GRANTED'
        ELSE 'NO ADMIN ACCESS'
    END as status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'agnesmobiles.b2b@gmail.com';