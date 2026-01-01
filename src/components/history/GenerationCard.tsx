'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Generation, FLUX_MODELS } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface GenerationCardProps {
  generation: Generation;
  onDelete: (id: string) => Promise<boolean>;
}

export function GenerationCard({ generation, onDelete }: GenerationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const modelName = FLUX_MODELS.find((m) => m.id === generation.model)?.name || generation.model;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(generation.id);
    setIsDeleting(false);
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="group cursor-pointer bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative aspect-square bg-muted">
            <Image
              src={generation.output_image_url}
              alt="Generated image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 300px"
            />
          </div>
          <div className="p-3 space-y-1">
            <p className="text-sm font-mono truncate" title={generation.prompt_raw}>
              {generation.prompt_raw}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{modelName}</span>
              <span>{formatDate(generation.created_at)}</span>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generation Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-square max-h-[60vh] bg-muted rounded-lg overflow-hidden">
            <Image
              src={generation.output_image_url}
              alt="Generated image"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">Prompt (@ syntax)</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">{generation.prompt_raw}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Expanded Prompt</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">{generation.prompt_expanded}</p>
            </div>

            {generation.reference_snapshots?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">References Used</h4>
                <div className="flex flex-wrap gap-2">
                  {generation.reference_snapshots.map((ref, i) => (
                    <div key={ref.id} className="flex items-center gap-2 bg-muted rounded p-1.5 pr-3">
                      <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={ref.image_url}
                          alt={ref.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] font-mono px-0.5 rounded-tl">
                          {i + 1}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">@{ref.name}</p>
                        {ref.description && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                            {ref.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Model:</span> {modelName}
                </p>
                {generation.seed && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Seed:</span> {generation.seed}
                  </p>
                )}
                {generation.reference_snapshots?.length > 0 ? (
                  <div className="text-sm">
                    <span className="text-muted-foreground">References:</span>{' '}
                    {generation.reference_snapshots.map((ref, i) => (
                      <span key={ref.id}>
                        @{ref.name}
                        {i < generation.reference_snapshots.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">
                    <span className="text-muted-foreground">References:</span>{' '}
                    {generation.reference_image_ids.length}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generation.output_image_url;
                    link.download = `flux-${generation.id}.png`;
                    link.click();
                  }}
                >
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
