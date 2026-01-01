'use client';

import Image from 'next/image';
import { ReferenceImage } from '@/types';

interface ReferenceDropdownProps {
  references: ReferenceImage[]; // Already filtered by parent
  searchQuery: string;
  onSelect: (reference: ReferenceImage) => void;
  position: { top: number; left: number };
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
}

export function ReferenceDropdown({
  references,
  onSelect,
  position,
  selectedIndex,
  onSelectedIndexChange,
}: ReferenceDropdownProps) {
  if (references.length === 0) {
    return (
      <div
        className="absolute z-50 bg-[#262626] border border-[#3a3a3a] rounded-lg shadow-xl p-3 text-sm text-[#888]"
        style={{ top: position.top, left: Math.max(0, position.left) }}
      >
        No matching references
      </div>
    );
  }

  return (
    <div
      className="absolute z-50 bg-[#262626] border border-[#3a3a3a] rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: Math.max(0, position.left),
        minWidth: '220px',
        maxWidth: '320px',
        maxHeight: '260px'
      }}
    >
      <div className="overflow-y-auto max-h-[260px] py-1">
        {references.map((reference, index) => (
          <button
            key={reference.id}
            onClick={() => onSelect(reference)}
            onMouseEnter={() => onSelectedIndexChange(index)}
            className={`
              w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors
              ${index === selectedIndex ? 'bg-[#3a3a3a]' : 'hover:bg-[#333]'}
            `}
          >
            <div className="relative w-7 h-7 rounded overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
              <Image
                src={reference.image_url}
                alt={reference.name}
                fill
                className="object-cover"
                sizes="28px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-white truncate">@{reference.name}</p>
              {reference.description && (
                <p className="text-[11px] text-[#888] truncate leading-tight">
                  {reference.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
