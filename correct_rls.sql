-- CORRECT RLS policies for profiles table

-- First, check current policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- Drop ALL policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Create correct policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Verify new policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
