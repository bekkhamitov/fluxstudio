'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
  tempName: string;
  pendingId: string;
  status: 'uploading' | 'analyzing' | 'done';
}

interface ReferenceUploaderProps {
  onUpload: (file: File, name: string, description: string, pendingId: string) => Promise<void>;
  onQuickUpload: (file: File, tempName: string, previewUrl: string) => string;
  onUpdateReference: (tempId: string, name: string, description: string) => void;
  disabled?: boolean;
  referenceCount: number;
}

export function ReferenceUploader({
  onUpload,
  onQuickUpload,
  onUpdateReference,
  disabled,
  referenceCount
}: ReferenceUploaderProps) {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);

  const processFile = useCallback(
    async (file: File, index: number) => {
      const tempId = `temp_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);
      const tempName = `image${referenceCount + index + 1}`;

      // Immediately show the image in the grid with temp name
      // This returns the pending ID that we need to pass to onUpload
      const pendingId = onQuickUpload(file, tempName, previewUrl);

      // Add to pending uploads for visual feedback
      setPendingUploads(prev => [...prev, {
        id: tempId,
        file,
        previewUrl,
        tempName,
        pendingId,
        status: 'uploading'
      }]);

      try {
        // Start upload with pendingId so it replaces instead of adding
        const uploadPromise = onUpload(file, tempName, '', pendingId);

        // Analyze in parallel
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setPendingUploads(prev =>
          prev.map(p => p.id === tempId ? { ...p, status: 'analyzing' } : p)
        );

        const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

        // Analyze image with Claude
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mediaType }),
        });

        // Wait for upload to complete
        await uploadPromise;

        if (response.ok) {
          const analysis = await response.json();
          // Update the reference with analyzed name/description
          onUpdateReference(tempName, analysis.name, analysis.description);
        }

        setPendingUploads(prev => prev.filter(p => p.id !== tempId));
        URL.revokeObjectURL(previewUrl);
      } catch (error) {
        console.error('Upload error:', error);
        setPendingUploads(prev => prev.filter(p => p.id !== tempId));
        URL.revokeObjectURL(previewUrl);
      }
    },
    [onUpload, onQuickUpload, onUpdateReference, referenceCount]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Process all files in parallel for faster upload
      await Promise.all(
        acceptedFiles.map((file, index) => processFile(file, index))
      );
    },
    [processFile]
  );

  const isUploading = pendingUploads.length > 0;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    disabled: disabled || isUploading,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
        transition-colors border
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <svg
        className="h-4 w-4 text-muted-foreground"
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
      <span className="text-sm text-muted-foreground">
        {isDragActive ? 'Drop here' : 'Add images'}
      </span>
    </div>
  );
}
