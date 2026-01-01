'use client';

import { GenerationStatus } from '@/types';

interface GenerateButtonProps {
  onClick: () => void;
  status: GenerationStatus;
  disabled?: boolean;
}

export function GenerateButton({ onClick, status, disabled }: GenerateButtonProps) {
  const isLoading = status.status === 'pending' || status.status === 'generating';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        h-10 w-10 rounded-lg flex items-center justify-center transition-all
        ${disabled || isLoading
          ? 'bg-[#1a1a1a] border border-[#2a2a2a] cursor-not-allowed'
          : 'bg-[#254130] hover:bg-[#2d5039] active:scale-95 cursor-pointer'
        }
      `}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg
          className={`h-4 w-4 ${disabled ? 'text-[#555]' : 'text-white'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )}
    </button>
  );
}
