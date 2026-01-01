'use client';

import { FluxModel, FLUX_MODELS } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModelSelectorProps {
  value: FluxModel;
  onChange: (model: FluxModel) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const selected = FLUX_MODELS.find((m) => m.id === value) || FLUX_MODELS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled}
          className="h-10 px-4 flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm transition-colors hover:bg-[#262626] hover:border-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-white whitespace-nowrap">{selected.name}</span>
          <svg className="h-3 w-3 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] bg-[#1a1a1a] border-[#2a2a2a]">
        {FLUX_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`flex flex-col items-start gap-0.5 py-2.5 px-3 cursor-pointer ${
              model.id === value ? 'bg-[#254130]' : 'hover:bg-[#262626]'
            }`}
          >
            <span className="font-medium text-white">{model.name}</span>
            <span className="text-xs text-[#888]">{model.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
