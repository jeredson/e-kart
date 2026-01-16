-- Get the user's email from auth.users
SELECT id, email FROM auth.users WHERE id = '794a89e6-6d03-4e79-b448-c1c49edb2f54';

-- Add or update the user_profiles entry with complete data
INSERT INTO user_profiles (id, first_name, last_name, email, phone_number, shop_name, created_at)
VALUES (
  '794a89e6-6d03-4e79-b448-c1c49edb2f54',
  'Test',
  'User',
  'REPLACE_WITH_ACTUAL_EMAIL',  -- Replace this with the email from the query above
  '1234567890',
  'Test Shop',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  shop_name = EXCLUDED.shop_name;

-- Verify the data
SELECT * FROM user_profiles WHERE id = '794a89e6-6d03-4e79-b448-c1c49edb2f54';
