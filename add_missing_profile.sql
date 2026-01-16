-- Add the missing profile for the user
INSERT INTO profiles (id, is_admin, is_approved, created_at)
VALUES ('1ed57c93-bd6b-4a01-8ed5-86788fbef00d', false, true, NOW())
ON CONFLICT (id) DO UPDATE SET is_approved = true;

-- Add user_profiles entry
INSERT INTO user_profiles (id, first_name, last_name, email, created_at)
VALUES ('1ed57c93-bd6b-4a01-8ed5-86788fbef00d', 'Jeredson', 'User', 'jeredson12108@gmail.com', NOW())
ON CONFLICT (id) DO UPDATE SET email = 'jeredson12108@gmail.com';

-- Verify both entries exist
SELECT * FROM profiles WHERE id = '1ed57c93-bd6b-4a01-8ed5-86788fbef00d';
SELECT * FROM user_profiles WHERE id = '1ed57c93-bd6b-4a01-8ed5-86788fbef00d';

-- Check all profiles
SELECT * FROM profiles ORDER BY created_at DESC;
