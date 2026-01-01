'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useReferences } from '@/hooks/useReferences';
import { useGeneration } from '@/hooks/useGeneration';
import { usePromptParser } from '@/hooks/usePromptParser';
import { FluxModel, ReferenceImage } from '@/types';
import { AuthButton } from '@/components/auth/AuthButton';
import { ReferenceUploader } from '@/components/workspace/ReferenceUploader';
import { ReferenceGrid } from '@/components/workspace/ReferenceGrid';
import { PromptEditor } from '@/components/workspace/PromptEditor';
import { ExpandedPreview } from '@/components/workspace/ExpandedPreview';
import { ModelSelector } from '@/components/workspace/ModelSelector';
import { GenerateButton } from '@/components/workspace/GenerateButton';
import { GenerationResult } from '@/components/workspace/GenerationResult';
import { toast } from 'sonner';

export default function Home() {
  const [user, setUser] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<FluxModel>('flux-2-pro');
  const [sessionReferences, setSessionReferences] = useState<ReferenceImage[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const {
    references: savedReferences,
    loading: refsLoading,
    addReference,
    updateReference,
    deleteReference,
  } = useReferences();

  const { status, generate, reset } = useGeneration();

  // Combine session and saved references, with session refs first
  const allReferences = [...sessionReferences, ...savedReferences];

  const { expandedPrompt, orderedReferences } = usePromptParser(prompt, allReferences);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(!!user);
      if (!user) {
        router.push('/auth/login');
      }
    };
    checkUser();
  }, [supabase.auth, router]);

  const handleUpload = async (file: File, name: string, description: string) => {
    const result = await addReference(file, name, description);
    if (result) {
      toast.success(`Added @${result.name}`);
    } else {
      toast.error('Failed to upload image');
    }
  };

  const handleReorder = (newOrder: ReferenceImage[]) => {
    // Split back into session and saved
    const sessionIds = new Set(sessionReferences.map((r) => r.id));
    const newSession = newOrder.filter((r) => sessionIds.has(r.id));
    setSessionReferences(newSession);
    // Note: For saved references, we'd need to update order in DB if we want persistence
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const result = await generate(
      prompt,
      expandedPrompt,
      orderedReferences,
      model
    );

    if (result) {
      toast.success('Image generated successfully!');
    }
  };

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="font-semibold text-lg">FLUX Studio</span>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Reference Images Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Reference Images</h2>
            <span className="text-sm text-muted-foreground">
              {allReferences.length}/8 images
            </span>
          </div>

          <ReferenceUploader
            onUpload={handleUpload}
            disabled={allReferences.length >= 8 || status.status === 'generating'}
          />

          {refsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ReferenceGrid
              references={allReferences}
              onReorder={handleReorder}
              onUpdate={updateReference}
              onDelete={deleteReference}
            />
          )}
        </section>

        {/* Prompt Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Prompt</h2>

          <PromptEditor
            value={prompt}
            onChange={setPrompt}
            references={allReferences}
            disabled={status.status === 'generating'}
          />

          <ExpandedPreview
            prompt={prompt}
            expandedPrompt={expandedPrompt}
            orderedReferences={orderedReferences}
          />
        </section>

        {/* Generation Controls */}
        <section className="flex flex-wrap items-center gap-4">
          <ModelSelector
            value={model}
            onChange={setModel}
            disabled={status.status === 'generating'}
          />
          <GenerateButton
            onClick={handleGenerate}
            status={status}
            disabled={!prompt.trim()}
          />
        </section>

        {/* Result */}
        <GenerationResult status={status} onReset={reset} />
      </main>
    </div>
  );
}
