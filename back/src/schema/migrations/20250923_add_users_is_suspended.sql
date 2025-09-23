-- Migration: add is_suspended to users table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='is_suspended'
  ) THEN
    ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_suspended'
  ) THEN
    ALTER TABLE users
    ADD COLUMN is_suspended boolean DEFAULT false;
  END IF;
END$$;
