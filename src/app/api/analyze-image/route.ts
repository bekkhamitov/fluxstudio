import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { image, mediaType } = await request.json();

    if (!image || !mediaType) {
      return NextResponse.json(
        { error: 'Missing image or mediaType' },
        { status: 400 }
      );
    }

    const analysis = await analyzeImage(image, mediaType);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
