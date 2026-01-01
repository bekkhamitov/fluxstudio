'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReferenceImage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReferenceCardProps {
  reference: ReferenceImage;
  index: number;
  onUpdate: (id: string, updates: { name?: string; description?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  isDragging?: boolean;
}

export function ReferenceCard({
  reference,
  index,
  onUpdate,
  onDelete,
  isDragging,
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
        group relative bg-card border rounded-lg overflow-hidden
        transition-all
        ${isDragging ? 'shadow-lg ring-2 ring-primary' : 'hover:shadow-md'}
      `}
    >
      {/* Position indicator */}
      <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded">
        [{index + 1}]
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <Image
          src={reference.image_url}
          alt={reference.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 200px"
        />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {isEditing ? (
          <>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="h-8 text-sm"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="flex-1 h-7 text-xs">
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm truncate">@{reference.name}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 p-0"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            </div>
            {reference.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {reference.description}
              </p>
            )}
          </>
        )}
      </div>

      {/* Drag handle */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <svg
          className="h-5 w-5 text-white drop-shadow"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>
    </div>
  );
}
