-- Create a table for storing user prompts
-- Note: user_id is now a TEXT field to store Clerk user IDs (format: user_xxxxxxxxx)
CREATE TABLE IF NOT EXISTS prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    original_prompt TEXT NOT NULL,
    optimized_prompt TEXT NOT NULL,
    model TEXT NOT NULL,
    tone TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Note: Row Level Security policies are now handled by application logic with Clerk authentication
-- The policies below are disabled since we're no longer using Supabase auth
-- Instead, the application verifies Clerk user identity server-side before database operations

-- Create a policy that allows users to see only their own prompts
-- CREATE POLICY "Users can view their own prompts" ON prompts
--     FOR SELECT USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own prompts
-- CREATE POLICY "Users can insert their own prompts" ON prompts
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own prompts
-- CREATE POLICY "Users can update their own prompts" ON prompts
--     FOR UPDATE USING (auth.uid() = user_id);

-- Create a policy that allows users to delete their own prompts
-- CREATE POLICY "Users can delete their own prompts" ON prompts
--     FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 