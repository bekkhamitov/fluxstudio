'use client';

import { Button } from '@/components/ui/button';
import { GenerationStatus } from '@/types';

interface GenerateButtonProps {
  onClick: () => void;
  status: GenerationStatus;
  disabled?: boolean;
}

export function GenerateButton({ onClick, status, disabled }: GenerateButtonProps) {
  const isLoading = status.status === 'pending' || status.status === 'generating';

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="min-w-[140px]"
      size="lg"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {status.status === 'pending' ? 'Submitting...' : 'Generating...'}
        </span>
      ) : (
        <span className="flex items-center gap-2">
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Generate
        </span>
      )}
    </Button>
  );
}
