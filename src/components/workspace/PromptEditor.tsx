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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  // Get filtered references for keyboard navigation
  const filteredReferences = references.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query)
    );
  });

  // Calculate accurate cursor position using a mirror element
  const calculateDropdownPosition = useCallback((textarea: HTMLTextAreaElement, textBeforeCursor: string) => {
    if (!mirrorRef.current || !containerRef.current) return;

    const mirror = mirrorRef.current;
    const container = containerRef.current;

    // Copy textarea styles to mirror
    const styles = window.getComputedStyle(textarea);
    mirror.style.font = styles.font;
    mirror.style.fontSize = styles.fontSize;
    mirror.style.fontFamily = styles.fontFamily;
    mirror.style.fontWeight = styles.fontWeight;
    mirror.style.lineHeight = styles.lineHeight;
    mirror.style.padding = styles.padding;
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';

    // Set content up to cursor with a marker span
    mirror.innerHTML = textBeforeCursor.replace(/\n/g, '<br>') + '<span id="cursor-marker">|</span>';

    const marker = mirror.querySelector('#cursor-marker');
    if (marker) {
      const markerRect = marker.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setDropdownPosition({
        top: markerRect.bottom - containerRect.top + 4,
        left: Math.max(0, Math.min(markerRect.left - containerRect.left, containerRect.width - 240)),
      });
    }
  }, []);

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
      setSelectedIndex(0); // Reset selection when typing
      setShowDropdown(true);

      // Calculate dropdown position
      if (textareaRef.current) {
        calculateDropdownPosition(textareaRef.current, textBeforeCursor);
      }
    } else {
      setShowDropdown(false);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === 'Escape') {
      setShowDropdown(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredReferences.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (filteredReferences[selectedIndex]) {
        handleSelectReference(filteredReferences[selectedIndex]);
      }
      return;
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* Hidden mirror element for cursor position calculation */}
      <div
        ref={mirrorRef}
        aria-hidden="true"
        className="absolute top-0 left-0 invisible overflow-hidden"
        style={{ pointerEvents: 'none' }}
      />

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[100px] resize-none text-base bg-transparent border-0 focus-visible:ring-0 p-0"
        rows={3}
      />

      {showDropdown && (
        <ReferenceDropdown
          references={filteredReferences}
          searchQuery={searchQuery}
          onSelect={handleSelectReference}
          position={dropdownPosition}
          selectedIndex={selectedIndex}
          onSelectedIndexChange={setSelectedIndex}
        />
      )}
    </div>
  );
}
