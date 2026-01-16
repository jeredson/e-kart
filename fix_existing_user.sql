-- Fix: The profiles table shouldn't have an email column
-- Email should only be in user_profiles table

-- 1. Update the non-admin user to be approved
UPDATE profiles SET is_approved = true WHERE id = '1ed57c93-bd6b-4a01-8ed5-86788fbef00d';

-- 2. Check if user_profiles exists for this user
SELECT * FROM user_profiles WHERE id = '1ed57c93-bd6b-4a01-8ed5-86788fbef00d';

-- 3. If no user_profiles entry, you need to add it manually
-- Get the email from auth.users first:
SELECT id, email FROM auth.users WHERE id = '1ed57c93-bd6b-4a01-8ed5-86788fbef00d';

-- 4. Then insert into user_profiles (replace EMAIL with actual email from step 3)
INSERT INTO user_profiles (id, first_name, last_name, email, created_at)
VALUES ('1ed57c93-bd6b-4a01-8ed5-86788fbef00d', 'Test', 'User', 'ACTUAL-EMAIL-HERE', NOW())
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
