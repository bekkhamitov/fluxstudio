'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useHistory } from '@/hooks/useHistory';
import { Sidebar } from '@/components/layout/Sidebar';
import { HistoryGrid } from '@/components/history/HistoryGrid';

export default function HistoryPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { generations, loading, error, deleteGeneration } = useHistory();

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
            <h1 className="text-2xl font-semibold text-white">Generation History</h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-[#1a1a1a] rounded-lg animate-pulse" />
                  <div className="h-4 bg-[#1a1a1a] rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-white mb-2">No generations yet</h2>
              <p className="text-[#888]">Your generated images will appear here</p>
            </div>
          ) : (
            <HistoryGrid generations={generations} onDelete={deleteGeneration} />
          )}
        </div>
      </main>
    </div>
  );
}
