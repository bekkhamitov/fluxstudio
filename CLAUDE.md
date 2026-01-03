# FLUX Studio 

## Problem

FLUX.2 supports up to 10 reference images for maintaining character, product, and style consistency across generations—a major differentiator no other model does well. But the BFL Playground UX makes this feature nearly unusable: images are just numbered 1-4 with no identification, references don't persist across sessions, prompts require error-prone syntax like "put the person from image 2 in the setting from image 3", and there's no visibility into what FLUX actually receives. The result: FLUX.2's best feature is locked behind friction.

## Solution

A workflow tool that makes FLUX multi-reference intuitive:
- **Smart Upload** - Drop an image, AI auto-generates a short name (1-2 words) and description
- **Instant Preview** - Images show immediately with temp names, analysis updates in background
- **@ Syntax** - Type `@` for dropdown, Tab/Enter to autocomplete, write naturally: "A woman driving @ferrari through @city"
- **Persistent Library** - References saved to Supabase, available via + menu "Assets"
- **Session References** - Each generation starts fresh, add references from library or upload new
- **"What FLUX Sees" Preview** - Shows expanded prompt (`@ferrari` → "the red Ferrari 488 (image 1)")
- **Generation History** - All outputs saved with prompts and references used
- **Reference Reordering** - Drag handle to reorder, position matters for FLUX
- **Size Selector** - Choose aspect ratio (1:1, 4:5, 9:16, etc.) or custom dimensions

## Tech Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (Auth with email/password, Storage, PostgreSQL)
- BFL API (FLUX.2), Anthropic API (Claude Haiku)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main workspace (sidebar + prompt editor)
│   ├── history/           # Generation history view
│   ├── auth/              # Login page + callback
│   └── api/               # API routes
│       ├── analyze-image/ # Claude Haiku image analysis
│       └── generate/      # BFL API wrapper
├── components/
│   ├── layout/            # Layout components
│   │   └── Sidebar        # Navigation sidebar (Generate, History, Assets)
│   ├── workspace/         # Main UI components
│   │   ├── PromptEditor   # @ syntax with keyboard navigation
│   │   ├── ReferenceDropdown # Autocomplete dropdown (absolute positioned)
│   │   ├── ReferenceCard  # Compact card with hover actions
│   │   ├── ReferenceGrid  # Drag-drop grid with dnd-kit
│   │   ├── AddMenu        # + button with Upload/Assets/History options
│   │   ├── SizeSelector   # Image size selector (presets + custom)
│   │   ├── ModelSelector  # FLUX model selector
│   │   ├── GenerateButton # Arrow button for generation
│   │   ├── ReferencesModal # Modal to select from saved references
│   │   ├── GenerationsModal # Modal to select from history
│   │   ├── ExpandedPreview # "What FLUX sees" preview
│   │   └── GenerationResult # Generated image display
│   ├── history/           # History view components
│   ├── auth/              # Auth button
│   └── ui/                # shadcn components
├── hooks/
│   ├── useReferences.ts   # CRUD + optimistic updates for references
│   ├── usePromptParser.ts # @ syntax parsing and expansion
│   ├── useGeneration.ts   # Generation state management
│   └── useHistory.ts      # History fetching
├── lib/
│   ├── supabase/          # Supabase clients (browser/server/middleware)
│   ├── bfl.ts             # BFL API client
│   └── anthropic.ts       # Claude API client (1-2 word names)
└── types/                 # TypeScript types (includes isPending for optimistic UI)
```

## Key Files

- `src/lib/bfl.ts` - BFL API integration (endpoints, polling, request building)
- `src/lib/anthropic.ts` - Claude Haiku image analysis (1-2 word names)
- `src/hooks/usePromptParser.ts` - @ syntax parsing and expansion
- `src/hooks/useReferences.ts` - Reference CRUD with optimistic updates
- `src/app/api/generate/route.ts` - Generation endpoint (BFL + storage)
- `supabase/schema.sql` - Database schema and RLS policies

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `BFL_API_KEY` - Black Forest Labs API key
- `ANTHROPIC_API_KEY` - Anthropic API key

## Database Tables

- `reference_images` - User's reference image library (with isPending for optimistic UI)
- `generations` - Generation history with prompts, outputs, and reference_snapshots (JSONB)

## Storage Buckets

- `references` - User uploaded reference images
- `outputs` - Generated images

## BFL API Notes

- Endpoints: `/v1/flux-2-pro`, `/v1/flux-2-max`, `/v1/flux-2-flex`
- Up to 8 reference images via `input_image`, `input_image_2`...`input_image_8`
- Async polling via `polling_url`, results expire in 10 minutes
- Auth via `x-key` header

## Core Features

1. **Sidebar Navigation** - Generate, History, Assets tabs on the side
2. **+ Menu** - Upload new images, select from Assets, or select from History
3. **Session References** - References are per-generation, not auto-loaded
4. **@ Syntax Editor** - Type @ for dropdown, Tab/Enter to select, Arrow keys to navigate
5. **Preview Panel** - Shows expanded prompt FLUX receives
6. **Model Selector** - Switch between pro/max/flex
7. **Size Selector** - Presets (1:1, 4:5, 9:16, etc.) + custom dimensions
8. **History** - All generations saved, can use as references

## UI/UX

- BFL Playground inspired dark theme (#0d0d0d background, green #22c55e accent)
- Sidebar navigation on the left (Generate, History, Assets)
- Large prompt card with textarea and bottom toolbar
- Toolbar has: + button (Assets/History/Upload), Model selector, Size selector, Settings, Generate arrow
- Session-based references below prompt card
- Generate button also appears under references when present


* Remember to always update @CLAUDE.md with changes that you've made!
