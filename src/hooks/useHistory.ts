'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Generation } from '@/types';

export function useHistory() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (isMounted) {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setGenerations(data || []);
        }
        setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [supabase, refreshTrigger]);

  const refreshHistory = () => {
    setRefreshTrigger((t) => t + 1);
  };

  const deleteGeneration = async (id: string) => {
    const gen = generations.find((g) => g.id === id);
    if (!gen) return false;

    // Delete from storage
    if (gen.output_storage_path) {
      const { error: storageError } = await supabase.storage
        .from('outputs')
        .remove([gen.output_storage_path]);

      if (storageError) {
        console.warn('Storage delete failed:', storageError);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('generations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(`Delete failed: ${deleteError.message}`);
      return false;
    }

    setGenerations((prev) => prev.filter((g) => g.id !== id));
    return true;
  };

  return {
    generations,
    loading,
    error,
    deleteGeneration,
    refreshHistory,
  };
}
