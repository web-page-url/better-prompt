-- Migration script to update existing Better Prompt database for Clerk authentication
-- Run this script ONLY if you have existing data from the Supabase auth version

-- IMPORTANT: Backup your database before running this migration!
-- This script converts the user_id column from UUID to TEXT to support Clerk user IDs

-- Step 1: Create a backup table
CREATE TABLE prompts_backup AS SELECT * FROM prompts;

-- Step 2: Drop existing RLS policies (they referenced auth.uid())
DROP POLICY IF EXISTS "Users can view their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can insert their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON prompts;

-- Step 3: Alter the user_id column to TEXT
-- Note: This will clear existing data since we can't map Supabase UUIDs to Clerk user IDs
-- If you have important data, you'll need to manually map users
ALTER TABLE prompts ALTER COLUMN user_id TYPE TEXT;

-- Step 4: If you want to preserve data, you can manually update user_ids
-- Replace 'old-uuid-here' with actual UUIDs and 'user_clerk_id_here' with Clerk user IDs
-- UPDATE prompts SET user_id = 'user_clerk_id_here' WHERE user_id = 'old-uuid-here';

-- Step 5: Re-enable RLS but without policies (handled by application)
-- RLS is now managed by application logic in API routes
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Migration complete
-- The application now handles user authentication through Clerk
-- All new prompts will use Clerk user IDs (format: user_xxxxxxxxx) 