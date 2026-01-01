'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReferenceImage } from '@/types';
import { Input } from '@/components/ui/input';

interface ReferenceCardProps {
  reference: ReferenceImage;
  index: number;
  onUpdate: (id: string, updates: { name?: string; description?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  isDragging?: boolean;
  dragListeners?: Record<string, unknown>;
}

export function ReferenceCard({
  reference,
  index,
  onUpdate,
  onDelete,
  isDragging,
  dragListeners,
}: ReferenceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(reference.name);
  const [description, setDescription] = useState(reference.description || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    const success = await onUpdate(reference.id, { name, description });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(reference.id);
    setIsDeleting(false);
  };

  const handleCancel = () => {
    setName(reference.name);
    setDescription(reference.description || '');
    setIsEditing(false);
  };

  return (
    <div
      className={`
        group relative flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2
        transition-all
        ${isDragging ? 'shadow-lg ring-2 ring-[#254130]' : 'hover:border-[#3a3a3a]'}
      `}
    >
      {/* Drag handle on left */}
      <div
        className="flex-shrink-0 w-6 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing rounded hover:bg-[#262626]"
        {...dragListeners}
      >
        <svg className="h-4 w-4 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Image thumbnail */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-[#0d0d0d]">
        <Image
          src={reference.image_url}
          alt={reference.name}
          fill
          className="object-cover"
          sizes="40px"
        />
        {/* Position indicator */}
        <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] font-mono px-1 rounded-tl flex items-center gap-0.5">
          {index + 1}
          {reference.isPending && (
            <svg className="animate-spin h-2 w-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>
      </div>

      {/* Name and description */}
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="h-6 text-xs bg-[#0d0d0d] border-[#2a2a2a] text-white"
            autoFocus
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="h-6 text-xs bg-[#0d0d0d] border-[#2a2a2a] text-white"
          />
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">@{reference.name}</p>
          <p className="text-xs text-[#888] truncate">
            {reference.description || 'No description'}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="h-7 px-2 text-xs text-white bg-[#254130] rounded transition-colors hover:bg-[#2d5039]"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="h-7 px-2 text-xs text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded transition-colors hover:bg-[#262626]"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#888] hover:text-white hover:bg-[#262626] rounded"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-7 w-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#888] hover:text-red-400 hover:bg-[#262626] rounded"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
