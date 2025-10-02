-- Migration: add role column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users
    ADD COLUMN role VARCHAR(50) DEFAULT 'user';
  END IF;
END$$;