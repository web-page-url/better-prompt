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

// Helper function to make OpenRouter API call
async function makeOpenRouterRequest(apiKey: string, model: string, enhancedSystemPrompt: string, prompt: string, controller: AbortController) {
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
  
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'deepseek/deepseek-r1-distill-llama-70b:free', tone = 'professional', type = 'general' } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey1 = process.env.OPENROUTER_API_KEY;
    const apiKey2 = process.env.OPENROUTER_API_KEY2;
    
    if (!apiKey1 && !apiKey2) {
      return NextResponse.json(
        { error: 'OpenRouter API keys not configured' },
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

    let response;
    let usingKey2 = false;
    
    // Try primary API key first
    if (apiKey1) {
      try {
        response = await makeOpenRouterRequest(apiKey1, model, enhancedSystemPrompt, prompt, controller);
        
        // If primary key is rate limited (429) or has quota issues (402), try secondary key
        if ((response.status === 429 || response.status === 402) && apiKey2) {
          console.log('Primary API key exhausted, switching to secondary key...');
          response = await makeOpenRouterRequest(apiKey2, model, enhancedSystemPrompt, prompt, controller);
          usingKey2 = true;
        }
      } catch (error) {
        // If primary key fails due to network issues and we have a secondary key, try it
        if (apiKey2) {
          console.log('Primary API key failed, trying secondary key...');
          response = await makeOpenRouterRequest(apiKey2, model, enhancedSystemPrompt, prompt, controller);
          usingKey2 = true;
        } else {
          throw error;
        }
      }
    } else if (apiKey2) {
      // If only secondary key is available
      response = await makeOpenRouterRequest(apiKey2, model, enhancedSystemPrompt, prompt, controller);
      usingKey2 = true;
    } else {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'No valid API keys configured' },
        { status: 500 }
      );
    }

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
      usage: data.usage,
      apiKeyUsed: usingKey2 ? 'secondary' : 'primary'
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