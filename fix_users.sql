-- Run this to check and fix user data

-- First, check if profiles exist
SELECT id, is_admin, is_approved FROM profiles WHERE is_admin = false;

-- Check if user_profiles exist
SELECT id, first_name, last_name, email FROM user_profiles;

-- If user_profiles are missing email, you need to manually add them
-- For each existing user, run:
-- UPDATE user_profiles SET email = 'user@example.com' WHERE id = 'user-uuid-here';

-- Make sure all non-admin users have is_approved set
UPDATE profiles SET is_approved = true WHERE is_admin = false AND is_approved IS NULL;
