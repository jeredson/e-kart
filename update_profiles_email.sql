-- Update profiles table with emails from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Verify the update
SELECT id, email, is_admin FROM profiles ORDER BY created_at DESC;
