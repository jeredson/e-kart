-- Add user_profiles entry for the existing user
INSERT INTO user_profiles (id, first_name, last_name, email, created_at)
VALUES ('1ed57c93-bd6b-4a01-8ed5-86788fbef00d', 'Jeredson', 'User', 'jeredson12108@gmail.com', NOW())
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Verify it was added
SELECT * FROM user_profiles WHERE id = '1ed57c93-bd6b-4a01-8ed5-86788fbef00d';

-- Check the complete user data
SELECT 
    p.id,
    p.is_admin,
    p.is_approved,
    up.first_name,
    up.last_name,
    up.email
FROM profiles p
LEFT JOIN user_profiles up ON p.id = up.id
WHERE p.is_admin = false;
