-- Add shop_name and shop_address to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS shop_name TEXT,
ADD COLUMN IF NOT EXISTS shop_address TEXT;
