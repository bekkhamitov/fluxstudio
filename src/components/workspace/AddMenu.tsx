'use client';

import { useState, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AddMenuProps {
  onUploadFiles: (files: File[]) => void;
  onOpenReferences: () => void;
  onOpenGenerations: () => void;
  disabled?: boolean;
}

export function AddMenu({
  onUploadFiles,
  onOpenReferences,
  onOpenGenerations,
  disabled,
}: AddMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUploadFiles(Array.from(files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            disabled={disabled}
            className="h-10 w-10 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg transition-all hover:bg-[#262626] hover:border-[#3a3a3a] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[180px] bg-[#1a1a1a] border-[#2a2a2a] rounded-lg p-1"
        >
          <DropdownMenuItem
            onClick={() => {
              onOpenReferences();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-white hover:bg-[#254130]"
          >
            <svg className="h-4 w-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Assets</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onOpenGenerations();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-white hover:bg-[#262626]"
          >
            <svg className="h-4 w-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">History</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleUploadClick}
            className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-white hover:bg-[#262626]"
          >
            <svg className="h-4 w-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-sm">Upload</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
