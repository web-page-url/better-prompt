import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'OPENROUTER_API_KEY not found in environment variables' 
        },
        { status: 500 }
      );
    }

    // Test with a minimal request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Better Prompt - API Key Test',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        valid: true,
        message: 'API key is valid',
        modelsAvailable: data.data?.length || 0
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        valid: false,
        status: response.status,
        error: errorText,
        message: response.status === 401 
          ? 'Invalid API key or insufficient permissions'
          : 'Network or service error'
      });
    }

  } catch (error) {
    return NextResponse.json({
      valid: false,
      error: 'Network error - cannot reach OpenRouter',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 