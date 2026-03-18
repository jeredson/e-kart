-- Set admin privileges for the user
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'agnesmobiles.b2b@gmail.com';

-- Verify the change
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'agnesmobiles.b2b@gmail.com';

-- Also check if there's a profiles table that needs updating
SELECT * FROM profiles WHERE email = 'agnesmobiles.b2b@gmail.com';

-- If profiles table exists, update it too
UPDATE profiles 
SET role = 'admin'
WHERE email = 'agnesmobiles.b2b@gmail.com';