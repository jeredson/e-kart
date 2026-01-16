-- Fix user creation issues

-- 1. Check if trigger exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user signup (NOT approved by default)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Insert into profiles table (NOT approved)
    INSERT INTO public.profiles (id, is_admin, is_approved, created_at)
    VALUES (NEW.id, false, false, NOW())
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Set existing non-admin users as approved (so they can continue using the site)
UPDATE profiles SET is_approved = true WHERE is_admin = false;

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
