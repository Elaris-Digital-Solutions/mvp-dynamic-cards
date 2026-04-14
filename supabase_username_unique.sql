-- 1. Safely add a UNIQUE constraint to the username column in the profiles table
-- This statement checks if the constraint already exists before adding it to avoid errors.
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- 2. Ensure an index exists to maintain fast lookups for username availability checks
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
