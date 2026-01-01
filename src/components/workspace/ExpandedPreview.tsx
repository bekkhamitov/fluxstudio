'use client';

import Image from 'next/image';
import { ReferenceImage } from '@/types';

interface ExpandedPreviewProps {
  prompt: string;
  expandedPrompt: string;
  orderedReferences: ReferenceImage[];
}

export function ExpandedPreview({
  prompt,
  expandedPrompt,
  orderedReferences,
}: ExpandedPreviewProps) {
  if (!prompt.trim()) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-[#888]">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        What FLUX will see
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 space-y-3">
        <p className="text-sm font-mono text-white whitespace-pre-wrap break-words">
          {expandedPrompt}
        </p>

        {orderedReferences.length > 0 && (
          <div className="pt-2 border-t border-[#2a2a2a]">
            <p className="text-xs text-[#888] mb-2">
              Reference images (in order):
            </p>
            <div className="flex gap-2 flex-wrap">
              {orderedReferences.map((ref, index) => (
                <div
                  key={ref.id}
                  className="relative group"
                  title={`${ref.name}: ${ref.description || 'No description'}`}
                >
                  <div className="relative w-10 h-10 rounded overflow-hidden bg-[#0d0d0d]">
                    <Image
                      src={ref.image_url}
                      alt={ref.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="absolute -top-1 -left-1 bg-[#254130] text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
