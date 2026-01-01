'use client';

import { useState } from 'react';
import { GenerationStatus, ReferenceImage, FluxModel, Generation } from '@/types';

export function useGeneration() {
  const [status, setStatus] = useState<GenerationStatus>({ status: 'idle' });

  const generate = async (
    promptRaw: string,
    promptExpanded: string,
    references: ReferenceImage[],
    model: FluxModel,
    options?: { width?: number; height?: number; seed?: number }
  ): Promise<Generation | null> => {
    setStatus({ status: 'pending' });

    try {
      setStatus({ status: 'generating' });

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptRaw,
          promptExpanded,
          references,
          model,
          ...options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const data = await response.json();

      setStatus({
        status: 'complete',
        result: {
          imageUrl: data.generation.output_image_url,
          generationId: data.generation.id,
        },
      });

      return data.generation;
    } catch (error) {
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  };

  const reset = () => {
    setStatus({ status: 'idle' });
  };

  return {
    status,
    generate,
    reset,
  };
}
