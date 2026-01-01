'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useReferences } from '@/hooks/useReferences';
import { useGeneration } from '@/hooks/useGeneration';
import { useHistory } from '@/hooks/useHistory';
import { usePromptParser } from '@/hooks/usePromptParser';
import { FluxModel, ReferenceImage, Generation } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { PromptEditor } from '@/components/workspace/PromptEditor';
import { ReferenceGrid } from '@/components/workspace/ReferenceGrid';
import { ExpandedPreview } from '@/components/workspace/ExpandedPreview';
import { ModelSelector } from '@/components/workspace/ModelSelector';
import { GenerateButton } from '@/components/workspace/GenerateButton';
import { GenerationResult } from '@/components/workspace/GenerationResult';
import { AddMenu } from '@/components/workspace/AddMenu';
import { SizeSelector, ImageSize } from '@/components/workspace/SizeSelector';
import { ReferencesModal } from '@/components/workspace/ReferencesModal';
import { GenerationsModal } from '@/components/workspace/GenerationsModal';
import { toast } from 'sonner';

export default function Home() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<FluxModel>('flux-2-pro');
  const [imageSize, setImageSize] = useState<ImageSize>({ width: 1024, height: 1024, label: '1:1' });

  // Session references - only for current generation
  const [sessionReferences, setSessionReferences] = useState<ReferenceImage[]>([]);

  // Modals
  const [showReferencesModal, setShowReferencesModal] = useState(false);
  const [showGenerationsModal, setShowGenerationsModal] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const {
    references: savedReferences,
    addReference,
    updateReferenceByName,
    updateReference,
  } = useReferences();

  const { generations } = useHistory();
  const { status, generate, reset } = useGeneration();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser({ email: user.email });
      }
    };
    checkUser();
  }, [supabase.auth, router]);

  // Only session references for @ dropdown - user must add references first
  const { expandedPrompt, orderedReferences } = usePromptParser(prompt, sessionReferences);

  // Handle file upload from AddMenu
  const handleUploadFiles = useCallback(async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempName = `image${sessionReferences.length + i + 1}`;
      const previewUrl = URL.createObjectURL(file);

      // Add to session references immediately
      const pendingId = `pending_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const pendingRef: ReferenceImage = {
        id: pendingId,
        user_id: '',
        name: tempName,
        description: '',
        image_url: previewUrl,
        storage_path: '',
        created_at: new Date().toISOString(),
        isPending: true,
      };
      setSessionReferences(prev => [...prev, pendingRef]);

      // Upload to storage and save
      try {
        const result = await addReference(file, tempName, '', pendingId);
        if (result) {
          // Update session reference with saved data
          setSessionReferences(prev =>
            prev.map(r => r.id === pendingId ? result : r)
          );

          // Analyze image with Claude
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const data = reader.result as string;
              resolve(data.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64,
              mediaType: file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
            }),
          });

          if (response.ok) {
            const analysis = await response.json();
            // Update both session and saved references
            setSessionReferences(prev =>
              prev.map(r => r.id === result.id ? { ...r, name: analysis.name, description: analysis.description } : r)
            );
            updateReferenceByName(tempName, analysis.name, analysis.description);
            toast.success(`Renamed to @${analysis.name}`);
          }
        }
        URL.revokeObjectURL(previewUrl);
      } catch (error) {
        console.error('Upload error:', error);
        setSessionReferences(prev => prev.filter(r => r.id !== pendingId));
        URL.revokeObjectURL(previewUrl);
        toast.error('Failed to upload image');
      }
    }
  }, [sessionReferences.length, addReference, updateReferenceByName]);

  // Handle selecting references from modal
  const handleSelectReferences = (refs: ReferenceImage[]) => {
    setSessionReferences(prev => {
      // Filter out duplicates
      const existingIds = new Set(prev.map(r => r.id));
      const newRefs = refs.filter(r => !existingIds.has(r.id));
      return [...prev, ...newRefs];
    });
  };

  // Handle selecting generation from modal
  const handleSelectGeneration = async (gen: Generation) => {
    // Add generated image as a reference
    const tempName = `gen_${sessionReferences.length + 1}`;
    const newRef: ReferenceImage = {
      id: `gen_${gen.id}`,
      user_id: gen.user_id,
      name: tempName,
      description: `Generated: ${gen.prompt_raw.slice(0, 50)}...`,
      image_url: gen.output_image_url,
      storage_path: gen.output_storage_path,
      created_at: gen.created_at,
    };
    setSessionReferences(prev => [...prev, newRef]);
    toast.success('Added generated image as reference');
  };

  // Handle reorder of session references
  const handleReorder = (newOrder: ReferenceImage[]) => {
    setSessionReferences(newOrder);
  };

  // Handle update of session reference
  const handleUpdateSessionRef = async (id: string, updates: { name?: string; description?: string }) => {
    setSessionReferences(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
    // Also update in saved if it exists there
    await updateReference(id, updates);
    return true;
  };

  // Handle delete of session reference
  const handleDeleteSessionRef = async (id: string) => {
    setSessionReferences(prev => prev.filter(r => r.id !== id));
    return true;
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
      model,
      { width: imageSize.width, height: imageSize.height }
    );

    if (result) {
      toast.success('Image generated successfully!');
    }
  };

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="animate-pulse text-[#888]">Loading...</div>
      </div>
    );
  }

  const isGenerating = status.status === 'generating' || status.status === 'pending';

  return (
    <div className="flex h-screen bg-[#0d0d0d]">
      <Sidebar userName={user?.email} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Prompt Card */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
            {/* Prompt Text Area */}
            <div className="p-4">
              <PromptEditor
                value={prompt}
                onChange={setPrompt}
                references={sessionReferences}
                disabled={isGenerating}
                placeholder="Describe what you want to create..."
              />
            </div>

            {/* Bottom Toolbar */}
            <div className="px-4 py-3 border-t border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AddMenu
                  onUploadFiles={handleUploadFiles}
                  onOpenReferences={() => setShowReferencesModal(true)}
                  onOpenGenerations={() => setShowGenerationsModal(true)}
                  disabled={isGenerating || sessionReferences.length >= 8}
                />
              </div>

              <div className="flex items-center gap-2">
                <ModelSelector
                  value={model}
                  onChange={setModel}
                  disabled={isGenerating}
                />
                <SizeSelector
                  value={imageSize}
                  onChange={setImageSize}
                  disabled={isGenerating}
                />
                <GenerateButton
                  onClick={handleGenerate}
                  status={status}
                  disabled={!prompt.trim()}
                />
              </div>
            </div>
          </div>

          {/* Reference Images Section */}
          {sessionReferences.length > 0 && (
            <section className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-[#888]">Reference Images</h2>
                <span className="text-xs text-[#666]">
                  {sessionReferences.length}/8
                </span>
              </div>
              <ReferenceGrid
                references={sessionReferences}
                onReorder={handleReorder}
                onUpdate={handleUpdateSessionRef}
                onDelete={handleDeleteSessionRef}
              />
            </section>
          )}

          {/* Expanded Preview */}
          {orderedReferences.length > 0 && (
            <div className="mt-4">
              <ExpandedPreview
                prompt={prompt}
                expandedPrompt={expandedPrompt}
                orderedReferences={orderedReferences}
              />
            </div>
          )}

          {/* Generation Result */}
          <div className="mt-4">
            <GenerationResult status={status} onReset={reset} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <ReferencesModal
        open={showReferencesModal}
        onOpenChange={setShowReferencesModal}
        references={savedReferences}
        selectedIds={sessionReferences.map(r => r.id)}
        onSelect={handleSelectReferences}
      />

      <GenerationsModal
        open={showGenerationsModal}
        onOpenChange={setShowGenerationsModal}
        generations={generations}
        onSelect={handleSelectGeneration}
      />
    </div>
  );
}
