'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ImageSize {
  width: number;
  height: number;
  label: string;
}

const PRESET_SIZES: ImageSize[] = [
  { width: 1024, height: 1024, label: '1:1' },
  { width: 896, height: 1152, label: '4:5' },
  { width: 768, height: 1344, label: '9:16' },
  { width: 1152, height: 896, label: '5:4' },
  { width: 1344, height: 768, label: '16:9' },
];

interface SizeSelectorProps {
  value: ImageSize;
  onChange: (size: ImageSize) => void;
  disabled?: boolean;
}

export function SizeSelector({ value, onChange, disabled }: SizeSelectorProps) {
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customWidth, setCustomWidth] = useState(value.width.toString());
  const [customHeight, setCustomHeight] = useState(value.height.toString());

  const isPreset = PRESET_SIZES.some(
    (s) => s.width === value.width && s.height === value.height
  );

  const displayLabel = isPreset
    ? value.label
    : `${value.width}x${value.height}`;

  const handleCustomSave = () => {
    const width = Math.min(2048, Math.max(256, parseInt(customWidth) || 1024));
    const height = Math.min(2048, Math.max(256, parseInt(customHeight) || 1024));
    onChange({ width, height, label: `${width}x${height}` });
    setShowCustomDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={disabled}
            className="h-10 px-4 flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm transition-colors hover:bg-[#262626] hover:border-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-white">{displayLabel}</span>
            <svg className="h-3 w-3 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px] bg-[#1a1a1a] border-[#2a2a2a]">
          {PRESET_SIZES.map((size) => (
            <DropdownMenuItem
              key={size.label}
              onClick={() => onChange(size)}
              className={`flex justify-between items-center py-2 cursor-pointer ${
                size.width === value.width && size.height === value.height
                  ? 'bg-[#254130]'
                  : 'hover:bg-[#262626]'
              }`}
            >
              <span className="font-medium text-white">{size.label}</span>
              <span className="text-xs text-[#888]">
                {size.width}x{size.height}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          <DropdownMenuItem
            onClick={() => {
              setCustomWidth(value.width.toString());
              setCustomHeight(value.height.toString());
              setShowCustomDialog(true);
            }}
            className="py-2 cursor-pointer text-white hover:bg-[#262626]"
          >
            <span>Custom...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle className="text-white">Custom Size</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-[#888] mb-1 block">Width</label>
                <Input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  min={256}
                  max={2048}
                  className="bg-[#0d0d0d] border-[#2a2a2a] text-white"
                />
              </div>
              <span className="text-[#888] mt-5">x</span>
              <div className="flex-1">
                <label className="text-xs text-[#888] mb-1 block">Height</label>
                <Input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  min={256}
                  max={2048}
                  className="bg-[#0d0d0d] border-[#2a2a2a] text-white"
                />
              </div>
            </div>
            <p className="text-xs text-[#888]">
              Min: 256px, Max: 2048px
            </p>
            <button
              onClick={handleCustomSave}
              className="w-full h-10 bg-[#254130] text-white rounded-lg font-medium transition-colors hover:bg-[#2d5039]"
            >
              Apply
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
