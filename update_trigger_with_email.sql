-- Update the trigger to save email in profiles table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Insert into profiles table with email
    INSERT INTO public.profiles (id, email, is_admin, is_approved, created_at)
    VALUES (NEW.id, NEW.email, false, false, NOW())
    ON CONFLICT (id) DO UPDATE SET email = NEW.email;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing profiles with emails
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Verify
SELECT id, email, is_admin, is_approved FROM profiles ORDER BY created_at DESC;
