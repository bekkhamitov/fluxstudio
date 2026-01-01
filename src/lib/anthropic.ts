import Anthropic from '@anthropic-ai/sdk';
import { ImageAnalysis } from '@/types';

export async function analyzeImage(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
): Promise<ImageAnalysis> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analyze this image for use as a reference in AI image generation. Provide:
1. A very short name (1-2 words ONLY, lowercase with underscore if needed, e.g., "ferrari", "woman", "sunset", "red_car")
2. A brief description (1-2 sentences) of the key visual elements.

IMPORTANT: The name must be 1-2 words maximum. Keep it simple and memorable.

Respond in this exact JSON format:
{"name": "short_name", "description": "Brief description."}`,
          },
        ],
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  try {
    const parsed = JSON.parse(textContent.text);
    return {
      name: parsed.name || 'untitled',
      description: parsed.description || '',
    };
  } catch {
    // If JSON parsing fails, try to extract from text
    return {
      name: 'untitled_' + Date.now().toString(36),
      description: textContent.text.slice(0, 200),
    };
  }
}
