-- Set user as admin by email
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'your-email@example.com'
);
