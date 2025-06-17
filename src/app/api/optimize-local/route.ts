import { NextRequest, NextResponse } from 'next/server';

// Alternative using Hugging Face Inference API (free)
const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

const SYSTEM_PROMPT = `You are a professional Prompt Engineer who helps users rewrite vague, poorly structured prompts into clear, detailed, and highly effective prompts optimized for large language models.

Instructions:
- Read the user's input prompt carefully.
- Rewrite it clearly, filling in missing context if needed.
- Format the result so it's suitable to be directly used with GPT or Claude for best results.
- Preserve original intent but make it more actionable and detailed.

Respond ONLY with the improved prompt.
Do not ask for clarification.
Do not add explanations or extra comments.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Simple prompt optimization without external API
    const optimizedPrompt = optimizePromptLocally(prompt);

    return NextResponse.json({
      optimizedPrompt,
      model: 'local-optimizer',
      usage: { note: 'Local optimization - no external API calls' }
    });

  } catch (error) {
    console.error('Local API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function optimizePromptLocally(input: string): string {
  const prompt = input.trim();
  
  // Basic prompt optimization rules
  let optimized = prompt;
  
  // Add context if missing
  if (!prompt.includes('please') && !prompt.includes('help')) {
    optimized = `Please help me with the following: ${optimized}`;
  }
  
  // Make it more specific
  if (prompt.length < 50) {
    optimized += `\n\nPlease provide:
- Clear and detailed instructions
- Specific examples if relevant
- Step-by-step guidance where appropriate
- Any important context or constraints`;
  }
  
  // Add structure for common patterns
  if (prompt.toLowerCase().includes('write')) {
    optimized += `\n\nFormat requirements:
- Use clear, professional language
- Include proper structure and organization
- Consider the target audience
- Ensure the content is engaging and informative`;
  }
  
  if (prompt.toLowerCase().includes('code')) {
    optimized += `\n\nCode requirements:
- Use best practices and clean code principles
- Include proper comments and documentation
- Handle edge cases and errors appropriately
- Follow relevant coding standards`;
  }
  
  if (prompt.toLowerCase().includes('email')) {
    optimized += `\n\nEmail requirements:
- Use appropriate professional tone
- Include clear subject line suggestion
- Structure with proper greeting, body, and closing
- Keep it concise but comprehensive`;
  }
  
  return optimized;
} 