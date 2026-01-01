'use client';

import { Generation } from '@/types';
import { GenerationCard } from './GenerationCard';

interface HistoryGridProps {
  generations: Generation[];
  onDelete: (id: string) => Promise<boolean>;
}

export function HistoryGrid({ generations, onDelete }: HistoryGridProps) {
  if (generations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <svg
          className="mx-auto h-12 w-12 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-lg font-medium">No generations yet</p>
        <p className="text-sm mt-1">Your generated images will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {generations.map((generation) => (
        <GenerationCard
          key={generation.id}
          generation={generation}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
