'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    addPendingReference,
    updateReferenceByName,
    updateReference,
    deleteReference,
  } = useReferences();

  const { status, generate, reset } = useGeneration();

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

  // Quick upload - shows image immediately with temp name
  const handleQuickUpload = (file: File, tempName: string, previewUrl: string): string => {
    return addPendingReference(tempName, previewUrl);
  };

  // Full upload - uploads to storage
  const handleUpload = async (file: File, name: string, description: string, pendingId: string) => {
    const result = await addReference(file, name, description, pendingId);
    if (!result) {
      toast.error('Failed to upload image');
    }
  };

  // Update reference after analysis
  const handleUpdateReference = (oldName: string, newName: string, description: string) => {
    updateReferenceByName(oldName, newName, description);
    toast.success(`Renamed to @${newName}`);
  };

  // Track reordered references in state for the current session
  const [reorderedRefs, setReorderedRefs] = useState<ReferenceImage[] | null>(null);

  // Use reordered refs if available, otherwise combine session and saved
  const allReferences = reorderedRefs ?? [...sessionReferences, ...savedReferences];

  const { expandedPrompt, orderedReferences } = usePromptParser(prompt, allReferences);

  const handleReorder = (newOrder: ReferenceImage[]) => {
    setReorderedRefs(newOrder);
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-primary"
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
              <span className="font-semibold">FLUX Studio</span>
            </div>
            <nav className="flex items-center gap-4">
              <span className="text-sm text-primary font-medium">Generate</span>
              <Link
                href="/history"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                History
              </Link>
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {/* Prompt Section - Main Focus */}
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <PromptEditor
            value={prompt}
            onChange={setPrompt}
            references={savedReferences}
            disabled={status.status === 'generating'}
            placeholder="Describe what you want to create... Use @ to reference images"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <ReferenceUploader
                onUpload={handleUpload}
                onQuickUpload={handleQuickUpload}
                onUpdateReference={handleUpdateReference}
                disabled={allReferences.length >= 8 || status.status === 'generating'}
                referenceCount={allReferences.length}
              />
              <ModelSelector
                value={model}
                onChange={setModel}
                disabled={status.status === 'generating'}
              />
            </div>
            <GenerateButton
              onClick={handleGenerate}
              status={status}
              disabled={!prompt.trim()}
            />
          </div>
        </div>

        {/* Reference Images Grid */}
        {(allReferences.length > 0 || refsLoading) && (
          <section className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Reference Images</h2>
              <span className="text-xs text-muted-foreground">
                {allReferences.length}/8
              </span>
            </div>

            {refsLoading ? (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
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
        )}

        {/* Expanded Preview */}
        {orderedReferences.length > 0 && (
          <div className="mt-6">
            <ExpandedPreview
              prompt={prompt}
              expandedPrompt={expandedPrompt}
              orderedReferences={orderedReferences}
            />
          </div>
        )}

        {/* Result */}
        <div className="mt-6">
          <GenerationResult status={status} onReset={reset} />
        </div>
      </main>
    </div>
  );
}
