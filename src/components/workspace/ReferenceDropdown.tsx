'use client';

import Image from 'next/image';
import { ReferenceImage } from '@/types';

interface ReferenceDropdownProps {
  references: ReferenceImage[];
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
    return null;
  }

  return (
    <div
      className="absolute z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: Math.max(0, position.left),
        minWidth: '200px',
        maxWidth: '280px',
        maxHeight: '240px'
      }}
    >
      <div className="overflow-y-auto max-h-[240px] py-1">
        {references.map((reference, index) => (
          <button
            key={reference.id}
            onClick={() => onSelect(reference)}
            onMouseEnter={() => onSelectedIndexChange(index)}
            className={`
              w-full flex items-center gap-2.5 px-2.5 py-2 text-left transition-colors
              ${index === selectedIndex ? 'bg-[#254130]' : 'hover:bg-[#262626]'}
            `}
          >
            <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-[#0d0d0d]">
              <Image
                src={reference.image_url}
                alt={reference.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">@{reference.name}</p>
              {reference.description && (
                <p className="text-xs text-[#888] truncate leading-tight">
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
