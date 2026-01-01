import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitGeneration, waitForResult, buildBflRequest } from '@/lib/bfl';
import { FluxModel, ReferenceImage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface GenerateRequestBody {
  promptRaw: string;
  promptExpanded: string;
  references: ReferenceImage[];
  model: FluxModel;
  width?: number;
  height?: number;
  seed?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateRequestBody = await request.json();
    const { promptRaw, promptExpanded, references, model, width, height, seed } = body;

    if (!promptExpanded) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const bflApiKey = process.env.BFL_API_KEY;
    if (!bflApiKey) {
      return NextResponse.json({ error: 'BFL API key not configured' }, { status: 500 });
    }

    // Get image URLs from references
    const imageUrls = references.map((ref) => ref.image_url);

    // Build and submit request
    const bflRequest = buildBflRequest(promptExpanded, imageUrls, { width, height, seed });
    const submitResponse = await submitGeneration(bflRequest, model, bflApiKey);

    // Wait for result
    const resultImageUrl = await waitForResult(submitResponse.polling_url, bflApiKey);

    // Download the image before it expires (10 min TTL)
    const imageResponse = await fetch(resultImageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    // Upload to Supabase storage
    const outputId = uuidv4();
    const storagePath = `${user.id}/${outputId}.png`;

    const { error: uploadError } = await supabase.storage
      .from('outputs')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('outputs')
      .getPublicUrl(storagePath);

    // Save generation record
    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        id: outputId,
        user_id: user.id,
        prompt_raw: promptRaw,
        prompt_expanded: promptExpanded,
        reference_image_ids: references.map((ref) => ref.id),
        output_image_url: publicUrl,
        output_storage_path: storagePath,
        model,
        seed: seed || null,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      generation,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
