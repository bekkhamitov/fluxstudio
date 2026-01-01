'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { GenerationStatus } from '@/types';

interface GenerationResultProps {
  status: GenerationStatus;
  onReset: () => void;
}

export function GenerationResult({ status, onReset }: GenerationResultProps) {
  if (status.status === 'idle') {
    return null;
  }

  if (status.status === 'error') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">Generation Failed</span>
        </div>
        <p className="text-sm text-red-400/80">{status.error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-[#2a2a2a] hover:bg-[#262626]"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (status.status === 'complete' && status.result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white">Generated Image</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#2a2a2a] hover:bg-[#262626]"
              onClick={() => {
                const link = document.createElement('a');
                link.href = status.result!.imageUrl;
                link.download = `flux-${status.result!.generationId}.png`;
                link.click();
              }}
            >
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="border-[#2a2a2a] hover:bg-[#262626]"
            >
              New Generation
            </Button>
          </div>
        </div>
        <div className="relative aspect-square max-w-2xl mx-auto bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
          <Image
            src={status.result.imageUrl}
            alt="Generated image"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      </div>
    );
  }

  return null;
}
