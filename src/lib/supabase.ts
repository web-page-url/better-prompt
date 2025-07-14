import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Prompt {
  id: string
  user_id: string
  title: string
  original_prompt: string
  optimized_prompt: string
  model: string
  tone: string
  type: string
  created_at: string
  updated_at: string
} 