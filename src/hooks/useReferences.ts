'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ReferenceImage } from '@/types';

export function useReferences() {
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchReferences = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reference_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (isMounted) {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setReferences(data || []);
        }
        setLoading(false);
      }
    };

    fetchReferences();

    return () => {
      isMounted = false;
    };
  }, [supabase, refreshTrigger]);

  const refreshReferences = () => {
    setRefreshTrigger((t) => t + 1);
  };

  // Add a pending reference with local preview (optimistic update)
  const addPendingReference = useCallback((tempName: string, previewUrl: string): string => {
    const tempId = `pending_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const pendingRef: ReferenceImage = {
      id: tempId,
      user_id: '',
      name: tempName,
      description: '',
      image_url: previewUrl,
      storage_path: '',
      created_at: new Date().toISOString(),
      isPending: true,
    };
    setReferences((prev) => [pendingRef, ...prev]);
    return tempId;
  }, []);

  // Update a reference by name (for updating pending refs after analysis)
  const updateReferenceByName = useCallback((
    oldName: string,
    newName: string,
    description: string
  ) => {
    setReferences((prev) =>
      prev.map((ref) =>
        ref.name === oldName ? { ...ref, name: newName, description } : ref
      )
    );
  }, []);

  // Replace a pending reference with the real one
  const replacePendingReference = useCallback((tempId: string, realRef: ReferenceImage) => {
    setReferences((prev) =>
      prev.map((ref) => (ref.id === tempId ? realRef : ref))
    );
  }, []);

  const addReference = async (
    file: File,
    name: string,
    description: string,
    pendingId?: string
  ): Promise<ReferenceImage | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      return null;
    }

    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('references')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      // Remove pending reference on error
      if (pendingId) {
        setReferences((prev) => prev.filter((r) => r.id !== pendingId));
      }
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('references')
      .getPublicUrl(fileName);

    // Insert into database
    const { data, error: insertError } = await supabase
      .from('reference_images')
      .insert({
        user_id: user.id,
        name,
        description,
        image_url: publicUrl,
        storage_path: fileName,
      })
      .select()
      .single();

    if (insertError) {
      setError(`Database insert failed: ${insertError.message}`);
      // Remove pending reference on error
      if (pendingId) {
        setReferences((prev) => prev.filter((r) => r.id !== pendingId));
      }
      return null;
    }

    // Replace pending with real reference, or add new
    if (pendingId) {
      replacePendingReference(pendingId, data);
    } else {
      setReferences((prev) => [data, ...prev]);
    }
    return data;
  };

  const updateReference = async (
    id: string,
    updates: { name?: string; description?: string }
  ) => {
    const { error: updateError } = await supabase
      .from('reference_images')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      setError(`Update failed: ${updateError.message}`);
      return false;
    }

    setReferences((prev) =>
      prev.map((ref) => (ref.id === id ? { ...ref, ...updates } : ref))
    );
    return true;
  };

  const deleteReference = async (id: string) => {
    const ref = references.find((r) => r.id === id);
    if (!ref) return false;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('references')
      .remove([ref.storage_path]);

    if (storageError) {
      console.warn('Storage delete failed:', storageError);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('reference_images')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(`Delete failed: ${deleteError.message}`);
      return false;
    }

    setReferences((prev) => prev.filter((r) => r.id !== id));
    return true;
  };

  return {
    references,
    loading,
    error,
    addReference,
    addPendingReference,
    updateReferenceByName,
    replacePendingReference,
    updateReference,
    deleteReference,
    refreshReferences,
  };
}
