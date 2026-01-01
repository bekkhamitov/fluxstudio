'use client';

import { useMemo } from 'react';
import { ReferenceImage, ParsedReference } from '@/types';

export function usePromptParser(prompt: string, references: ReferenceImage[]) {
  const parsed = useMemo(() => {
    // Find all @mentions in the prompt
    const mentionRegex = /@(\w+)/g;
    const mentions: ParsedReference[] = [];
    let match;

    while ((match = mentionRegex.exec(prompt)) !== null) {
      const name = match[1];
      const ref = references.find(
        (r) => r.name.toLowerCase() === name.toLowerCase()
      );
      if (ref) {
        mentions.push({
          name: ref.name,
          id: ref.id,
          position: mentions.length + 1, // 1-indexed position for FLUX
        });
      }
    }

    return mentions;
  }, [prompt, references]);

  const expandedPrompt = useMemo(() => {
    if (parsed.length === 0) return prompt;

    let expanded = prompt;

    // Build a map of reference name to position
    const refPositions = new Map<string, number>();
    parsed.forEach((p) => {
      refPositions.set(p.name.toLowerCase(), p.position);
    });

    // Replace @mentions with descriptions and image references
    parsed.forEach((p) => {
      const ref = references.find((r) => r.id === p.id);
      if (ref) {
        const regex = new RegExp(`@${p.name}\\b`, 'gi');
        // Include description if available, plus the image reference
        const replacement = ref.description
          ? `${ref.description} (image ${p.position})`
          : `(image ${p.position})`;
        expanded = expanded.replace(regex, replacement);
      }
    });

    return expanded;
  }, [prompt, parsed, references]);

  const orderedReferences = useMemo(() => {
    // Return references in the order they appear in the prompt
    return parsed
      .map((p) => references.find((r) => r.id === p.id))
      .filter((r): r is ReferenceImage => r !== undefined);
  }, [parsed, references]);

  return {
    parsedReferences: parsed,
    expandedPrompt,
    orderedReferences,
  };
}
