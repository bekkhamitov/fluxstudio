'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useHistory } from '@/hooks/useHistory';
import { AuthButton } from '@/components/auth/AuthButton';
import { HistoryGrid } from '@/components/history/HistoryGrid';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const [user, setUser] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { generations, loading, error, deleteGeneration } = useHistory();

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
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
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
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">History</span>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Generation History</h1>
          <Button asChild variant="outline">
            <Link href="/">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Generation
            </Link>
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-muted rounded-lg animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <HistoryGrid generations={generations} onDelete={deleteGeneration} />
        )}
      </main>
    </div>
  );
}
