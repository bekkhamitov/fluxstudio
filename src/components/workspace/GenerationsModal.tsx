'use client';

import Image from 'next/image';
import { Generation } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface GenerationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generations: Generation[];
  onSelect: (generation: Generation) => void;
}

export function GenerationsModal({
  open,
  onOpenChange,
  generations,
  onSelect,
}: GenerationsModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleAdd = () => {
    const gen = generations.find((g) => g.id === selected);
    if (gen) {
      onSelect(gen);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Select from History</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {generations.length === 0 ? (
            <div className="text-center py-12 text-[#888]">
              <p>No generations yet</p>
              <p className="text-sm mt-1">Generate images to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {generations.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => setSelected(gen.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selected === gen.id
                      ? 'border-[#254130] ring-2 ring-[#254130]/30'
                      : 'border-transparent hover:border-[#3a3a3a]'
                  }`}
                >
                  <Image
                    src={gen.output_image_url}
                    alt={gen.prompt_raw}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-white line-clamp-2">
                      {gen.prompt_raw}
                    </p>
                    <p className="text-[10px] text-[#888] mt-1">
                      {new Date(gen.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {selected === gen.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#254130] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
          <p className="text-sm text-[#888]">
            Select an image to use as reference
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-sm text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg transition-colors hover:bg-[#262626]"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!selected}
              className="h-9 px-4 text-sm text-white bg-[#254130] rounded-lg transition-colors hover:bg-[#2d5039] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use as Reference
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
