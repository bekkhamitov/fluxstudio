'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ReferenceImage } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { ReferenceDropdown } from './ReferenceDropdown';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  references: ReferenceImage[];
  disabled?: boolean;
  placeholder?: string;
}

export function PromptEditor({
  value,
  onChange,
  references,
  disabled,
  placeholder = 'Describe your image... Use @ to reference images',
}: PromptEditorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const pos = e.target.selectionStart;
    onChange(newValue);
    setCursorPosition(pos);

    // Check if we should show the dropdown
    const textBeforeCursor = newValue.slice(0, pos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setSearchQuery(atMatch[1]);
      setShowDropdown(true);

      // Calculate dropdown position
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const rect = textarea.getBoundingClientRect();
        // Approximate position based on character count
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length - 1;
        const charInLine = lines[lines.length - 1].length;

        setDropdownPosition({
          top: rect.top + (currentLine + 1) * lineHeight + 4,
          left: rect.left + Math.min(charInLine * 8, rect.width - 200),
        });
      }
    } else {
      setShowDropdown(false);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showDropdown && (e.key === 'Escape' || e.key === 'Tab')) {
      setShowDropdown(false);
    }
  };

  const handleSelectReference = useCallback(
    (reference: ReferenceImage) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const textBeforeCursor = value.slice(0, cursorPosition);
      const textAfterCursor = value.slice(cursorPosition);

      // Find the @ position
      const atMatch = textBeforeCursor.match(/@(\w*)$/);
      if (atMatch) {
        const atStart = cursorPosition - atMatch[0].length;
        const newValue =
          value.slice(0, atStart) + `@${reference.name}` + textAfterCursor;
        onChange(newValue);

        // Set cursor position after the inserted reference
        const newCursorPos = atStart + reference.name.length + 1;
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }

      setShowDropdown(false);
      setSearchQuery('');
    },
    [value, cursorPosition, onChange]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[120px] resize-none font-mono text-sm"
        rows={4}
      />

      {showDropdown && (
        <ReferenceDropdown
          references={references}
          searchQuery={searchQuery}
          onSelect={handleSelectReference}
          position={dropdownPosition}
        />
      )}

      {/* Character count and hint */}
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>Type @ to reference images</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
}
