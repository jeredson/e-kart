-- Run these queries one by one to diagnose the issue

-- 1. Check all auth users
SELECT id, email, created_at, email_confirmed_at FROM auth.users ORDER BY created_at DESC;

-- 2. Check all profiles
SELECT * FROM profiles ORDER BY created_at DESC;

-- 3. Check all user_profiles
SELECT * FROM user_profiles ORDER BY created_at DESC;

-- 4. If you see auth users but no profiles, run this to create them:
INSERT INTO public.profiles (id, is_admin, is_approved, created_at)
SELECT id, false, true, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. After running step 4, check profiles again
SELECT * FROM profiles ORDER BY created_at DESC;
