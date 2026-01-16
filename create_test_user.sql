-- To manually create a test user in Supabase:

-- 1. First create the auth user in Supabase Dashboard > Authentication > Users
--    Click "Add user" and enter email/password

-- 2. After creating the auth user, get their UUID and run:

-- Insert into profiles (replace 'USER-UUID-HERE' with actual UUID)
INSERT INTO profiles (id, is_admin, is_approved, created_at)
VALUES ('USER-UUID-HERE', false, true, NOW());

-- Insert into user_profiles (replace 'USER-UUID-HERE' and email)
INSERT INTO user_profiles (id, first_name, last_name, email, created_at)
VALUES ('USER-UUID-HERE', 'Test', 'User', 'testuser@example.com', NOW());

-- Or simply sign up a new user through the app's sign-up page
