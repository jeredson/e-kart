-- Add shop fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS shop_name TEXT,
ADD COLUMN IF NOT EXISTS shop_address TEXT;