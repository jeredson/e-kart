-- COMPREHENSIVE ADMIN SETUP FOR agnesmobiles.b2b@gmail.com
-- Run this in Supabase SQL Editor

-- 1. Set admin role in auth.users metadata
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'agnesmobiles.b2b@gmail.com';

-- 2. Get the user ID for profiles table update
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'agnesmobiles.b2b@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Check if profile exists
        IF EXISTS (SELECT 1 FROM profiles WHERE id = user_uuid) THEN
            -- Update existing profile
            UPDATE profiles 
            SET 
                is_admin = true,
                is_approved = true,
                email = 'agnesmobiles.b2b@gmail.com'
            WHERE id = user_uuid;
            
            RAISE NOTICE 'Updated existing profile for user %', user_uuid;
        ELSE
            -- Create new profile
            INSERT INTO profiles (id, email, is_admin, is_approved)
            VALUES (user_uuid, 'agnesmobiles.b2b@gmail.com', true, true);
            
            RAISE NOTICE 'Created new profile for user %', user_uuid;
        END IF;
    ELSE
        RAISE NOTICE 'User not found with email: agnesmobiles.b2b@gmail.com';
    END IF;
END $$;

-- 3. Verify the changes
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'role' as auth_role,
    p.is_admin,
    p.is_approved,
    p.email as profile_email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'agnesmobiles.b2b@gmail.com';

-- 4. Check if profiles table has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;