'use client';

import Image from 'next/image';
import { ReferenceImage } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface ReferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  references: ReferenceImage[];
  selectedIds: string[];
  onSelect: (references: ReferenceImage[]) => void;
}

export function ReferencesModal({
  open,
  onOpenChange,
  references,
  selectedIds,
  onSelect,
}: ReferencesModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size < 8) {
        newSelected.add(id);
      }
    }
    setSelected(newSelected);
  };

  const handleAdd = () => {
    const selectedRefs = references.filter((r) => selected.has(r.id));
    onSelect(selectedRefs);
    onOpenChange(false);
  };

  // Filter out already selected references
  const availableRefs = references.filter((r) => !selectedIds.includes(r.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Select Reference Images</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {availableRefs.length === 0 ? (
            <div className="text-center py-12 text-[#888]">
              <p>No saved reference images available</p>
              <p className="text-sm mt-1">Upload images to save them to your library</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {availableRefs.map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => toggleSelect(ref.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selected.has(ref.id)
                      ? 'border-[#254130] ring-2 ring-[#254130]/30'
                      : 'border-transparent hover:border-[#3a3a3a]'
                  }`}
                >
                  <Image
                    src={ref.image_url}
                    alt={ref.name}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white font-medium truncate">
                      @{ref.name}
                    </p>
                  </div>
                  {selected.has(ref.id) && (
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
            {selected.size} selected (max 8 total)
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
              disabled={selected.size === 0}
              className="h-9 px-4 text-sm text-white bg-[#254130] rounded-lg transition-colors hover:bg-[#2d5039] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Selected
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
