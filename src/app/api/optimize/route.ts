import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// System prompt for prompt optimization
const SYSTEM_PROMPT = `You are a professional Prompt Engineer who helps users rewrite vague, poorly structured prompts into clear, detailed, and highly effective prompts optimized for large language models.

Instructions:
- Read the user's input prompt carefully.
- Rewrite it clearly, filling in missing context if needed.
- Format the result so it's suitable to be directly used with GPT or Claude for best results.
- Preserve original intent but make it more actionable and detailed.

Respond ONLY with the improved prompt.
Do not add explanations or extra comments.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'meta-llama/llama-3.1-8b-instruct:free', tone = 'professional', type = 'general' } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Enhance the system prompt based on tone and type
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    
    if (tone !== 'professional') {
      enhancedSystemPrompt += `\n\nTone: Make the optimized prompt ${tone}.`;
    }
    
    if (type !== 'general') {
      enhancedSystemPrompt += `\n\nPrompt Type: Optimize specifically for ${type}.`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Better Prompt - Prompt Optimizer",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          {
            "role": "system",
            "content": enhancedSystemPrompt
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        "max_tokens": 1000,
        "temperature": 0.7
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', response.status, errorData);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key or insufficient permissions. Please check your OpenRouter API key.' },
          { status: 401 }
        );
      }
      
      if (response.status === 402) {
        return NextResponse.json(
          { error: 'Insufficient credits or quota exceeded. Try a different free model.' },
          { status: 402 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `OpenRouter API error (${response.status}): ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const optimizedPrompt = data.choices?.[0]?.message?.content;

    if (!optimizedPrompt) {
      return NextResponse.json(
        { error: 'No optimized prompt received' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      optimizedPrompt: optimizedPrompt.trim(),
      model,
      usage: data.usage
    });

  } catch (error) {
    console.error('API route error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - please try again' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          { error: 'Unable to connect to OpenRouter API. Please check your internet connection and try again.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 