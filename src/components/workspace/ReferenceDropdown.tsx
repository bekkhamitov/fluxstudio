'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ReferenceImage } from '@/types';

interface ReferenceDropdownProps {
  references: ReferenceImage[];
  searchQuery: string;
  onSelect: (reference: ReferenceImage) => void;
  position: { top: number; left: number };
}

export function ReferenceDropdown({
  references,
  searchQuery,
  onSelect,
  position,
}: ReferenceDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredReferences = useMemo(() => {
    if (!searchQuery) return references;
    const query = searchQuery.toLowerCase();
    return references.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
    );
  }, [references, searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredReferences.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredReferences[selectedIndex]) {
        onSelect(filteredReferences[selectedIndex]);
      }
    }
  };

  if (filteredReferences.length === 0) {
    return (
      <div
        className="fixed z-50 bg-popover border rounded-md shadow-lg p-3 text-sm text-muted-foreground"
        style={{ top: position.top, left: position.left, minWidth: '200px' }}
      >
        No matching references
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 bg-popover border rounded-md shadow-lg overflow-hidden"
      style={{ top: position.top, left: position.left, minWidth: '250px', maxHeight: '300px' }}
      onKeyDown={handleKeyDown}
    >
      <div className="overflow-y-auto max-h-[280px]">
        {filteredReferences.map((reference, index) => (
          <button
            key={reference.id}
            onClick={() => onSelect(reference)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`
              w-full flex items-center gap-3 p-2 text-left transition-colors
              ${index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'}
            `}
          >
            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
              <Image
                src={reference.image_url}
                alt={reference.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">@{reference.name}</p>
              {reference.description && (
                <p className="text-xs text-muted-foreground truncate">
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
