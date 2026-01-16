-- Fix user creation issues

-- 1. Check if trigger exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Insert into profiles table
    INSERT INTO public.profiles (id, is_admin, is_approved, created_at)
    VALUES (NEW.id, false, true, NOW())
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Fix existing users who don't have profiles
-- Get all auth users and create profiles for them (auto-approved)
INSERT INTO public.profiles (id, is_admin, is_approved, created_at)
SELECT id, false, true, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3. Verify the fix
SELECT 
    u.id,
    u.email,
    p.is_admin,
    p.is_approved,
    up.first_name,
    up.last_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;
