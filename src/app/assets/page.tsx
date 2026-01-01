'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useReferences } from '@/hooks/useReferences';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { ReferenceImage } from '@/types';

export default function AssetsPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { references, loading, error, deleteReference } = useReferences();

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

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="animate-pulse text-[#888]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d0d0d]">
      <Sidebar userName={user?.email} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-white">Reference Assets</h1>
            <p className="text-sm text-[#888]">{references.length} images</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-[#1a1a1a] rounded-lg animate-pulse" />
                  <div className="h-4 bg-[#1a1a1a] rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : references.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-white mb-2">No reference images</h2>
              <p className="text-[#888] mb-4">Upload images when generating to save them here</p>
              <Button onClick={() => router.push('/')}>
                Go to Generate
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {references.map((ref) => (
                <AssetCard key={ref.id} reference={ref} onDelete={deleteReference} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AssetCard({
  reference,
  onDelete,
}: {
  reference: ReferenceImage;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Delete this reference image?')) {
      setIsDeleting(true);
      await onDelete(reference.id);
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative">
      <div className="relative aspect-square bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a]">
        <Image
          src={reference.image_url}
          alt={reference.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-white truncate">@{reference.name}</p>
        <p className="text-xs text-[#888] truncate">
          {reference.description || 'No description'}
        </p>
      </div>
    </div>
  );
}
