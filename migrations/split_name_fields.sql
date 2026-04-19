-- ─── Migration: Split full_name into first_name + last_name ──────────────────
-- Run this in the Supabase SQL editor (dashboard → SQL editor).
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE).

-- 1. Add the new columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT;

-- 2. Migrate existing data by splitting full_name at the first space
UPDATE profiles
SET
  first_name = CASE
    WHEN full_name IS NULL OR trim(full_name) = '' THEN NULL
    WHEN strpos(trim(full_name), ' ') = 0           THEN trim(full_name)
    ELSE trim(split_part(trim(full_name), ' ', 1))
  END,
  last_name = CASE
    WHEN full_name IS NULL OR trim(full_name) = '' THEN NULL
    WHEN strpos(trim(full_name), ' ') = 0           THEN NULL
    ELSE trim(substr(trim(full_name), strpos(trim(full_name), ' ') + 1))
  END
WHERE first_name IS NULL AND last_name IS NULL;

-- 3. Trigger: keep full_name in sync whenever first_name / last_name change
CREATE OR REPLACE FUNCTION sync_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := NULLIF(trim(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_full_name ON profiles;
CREATE TRIGGER trg_sync_full_name
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_full_name();

-- 4. Also capture first_name / last_name from auth metadata on new user signup
--    (Updates the existing handle_new_user function if it exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    first_name,
    last_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
