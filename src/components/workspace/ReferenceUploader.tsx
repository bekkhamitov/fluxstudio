'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageAnalysis } from '@/types';

interface ReferenceUploaderProps {
  onUpload: (file: File, name: string, description: string) => Promise<void>;
  disabled?: boolean;
}

export function ReferenceUploader({ onUpload, disabled }: ReferenceUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadProgress('Analyzing image...');

      try {
        // Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Get media type
        const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

        // Analyze image with Claude
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mediaType }),
        });

        let analysis: ImageAnalysis;
        if (response.ok) {
          analysis = await response.json();
        } else {
          // Fallback if analysis fails
          analysis = {
            name: `image_${Date.now().toString(36)}`,
            description: '',
          };
        }

        setUploadProgress('Uploading...');

        // Upload with analyzed name/description
        await onUpload(file, analysis.name, analysis.description);

        setUploadProgress(null);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(null);
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        await processFile(file);
      }
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    disabled: disabled || uploading,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
      `}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="space-y-2">
          <div className="animate-pulse">
            <svg
              className="mx-auto h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">{uploadProgress}</p>
        </div>
      ) : isDragActive ? (
        <p className="text-sm text-primary">Drop images here...</p>
      ) : (
        <div className="space-y-2">
          <svg
            className="mx-auto h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-muted-foreground">
            Drop images here, or click to select
          </p>
          <p className="text-xs text-muted-foreground/70">
            Images will be auto-analyzed and named
          </p>
        </div>
      )}
    </div>
  );
}
