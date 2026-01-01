'use client';

import { FluxModel, FLUX_MODELS } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
        <Button variant="outline" disabled={disabled} className="min-w-[180px] justify-between">
          <span className="truncate">{selected.name}</span>
          <svg
            className="h-4 w-4 opacity-50 ml-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        {FLUX_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onChange(model.id)}
            className="flex flex-col items-start gap-1 py-2"
          >
            <span className="font-medium">{model.name}</span>
            <span className="text-xs text-muted-foreground">{model.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
