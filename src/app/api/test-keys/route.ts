import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey1 = process.env.OPENROUTER_API_KEY;
    const apiKey2 = process.env.OPENROUTER_API_KEY2;

    const results = {
      primaryKey: {
        configured: !!apiKey1,
        status: 'unknown'
      },
      secondaryKey: {
        configured: !!apiKey2,
        status: 'unknown'
      }
    };

    // Test primary key
    if (apiKey1) {
      try {
        const response1 = await fetch('https://openrouter.ai/api/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey1}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'Better Prompt - Key Test',
          },
        });
        
        results.primaryKey.status = response1.ok ? 'working' : `error-${response1.status}`;
      } catch (error) {
        results.primaryKey.status = 'network-error';
      }
    }

    // Test secondary key
    if (apiKey2) {
      try {
        const response2 = await fetch('https://openrouter.ai/api/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey2}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'Better Prompt - Key Test',
          },
        });
        
        results.secondaryKey.status = response2.ok ? 'working' : `error-${response2.status}`;
      } catch (error) {
        results.secondaryKey.status = 'network-error';
      }
    }

    return NextResponse.json({
      message: 'API Key Status Check',
      keys: results,
      totalDailyLimit: (apiKey1 && apiKey2) ? '400 requests (200 + 200)' : '200 requests'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to test API keys',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 