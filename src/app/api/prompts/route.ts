import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Create a server-side supabase client with service role for data storage
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Retrieve user's prompts
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    const { data: prompts, error } = await supabaseAdmin
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }

    // Return empty array if no prompts found
    return NextResponse.json({ prompts: prompts || [] });
  } catch (error) {
    console.error('Error in GET /api/prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save a new prompt
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      originalPrompt, 
      optimizedPrompt, 
      model, 
      tone, 
      type 
    } = body;

    if (!title || !originalPrompt || !optimizedPrompt || !model || !tone || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: prompt, error } = await supabaseAdmin
      .from('prompts')
      .insert([
        {
          user_id: userId,
          title,
          original_prompt: originalPrompt,
          optimized_prompt: optimizedPrompt,
          model,
          tone,
          type
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving prompt:', error);
      return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 });
    }

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 