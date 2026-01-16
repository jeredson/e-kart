-- Check all auth users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Check all profiles
SELECT id, is_admin, is_approved, created_at FROM profiles ORDER BY created_at DESC;

-- Find auth users without profiles
SELECT u.id, u.email 
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create profiles for users who don't have one
INSERT INTO profiles (id, is_admin, is_approved, created_at)
SELECT u.id, false, false, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify all users now have profiles
SELECT 
    u.id,
    u.email,
    p.is_admin,
    p.is_approved
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
