# FLUX Studio

## Problem

FLUX.2 supports up to 10 reference images for maintaining character, product, and style consistency across generations—a major differentiator no other model does well. But the BFL Playground UX makes this feature nearly unusable: images are just numbered 1-4 with no identification, references don't persist across sessions, prompts require error-prone syntax like "put the person from image 2 in the setting from image 3", and there's no visibility into what FLUX actually receives. The result: FLUX.2's best feature is locked behind friction.

## Solution

A workflow tool that makes FLUX multi-reference intuitive:
- **Smart Upload** - Drop an image, AI auto-generates a name (`red_ferrari`) and description
- **@ Syntax** - Type `@` for a dropdown of references, write naturally: "A woman driving @ferrari through @night_city"
- **Persistent Library** - References saved to Supabase, available across sessions
- **"What FLUX Sees" Preview** - Shows expanded prompt (`@ferrari` → "the red Ferrari 488 (image 1)")
- **Generation History** - All outputs saved with prompts and references used
- **Reference Reordering** - Drag to reorder, position matters for FLUX

## Tech Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (Auth, Storage, PostgreSQL)
- BFL API (FLUX.2), Anthropic API (Claude Haiku)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main workspace
│   ├── history/           # Generation history view
│   ├── auth/              # Login page + callback
│   └── api/               # API routes
│       ├── analyze-image/ # Claude Haiku image analysis
│       └── generate/      # BFL API wrapper
├── components/
│   ├── workspace/         # Main UI components
│   ├── history/           # History view components
│   ├── auth/              # Auth button
│   └── ui/                # shadcn components
├── hooks/                 # React hooks for state management
├── lib/
│   ├── supabase/          # Supabase clients (browser/server/middleware)
│   ├── bfl.ts             # BFL API client
│   └── anthropic.ts       # Claude API client
└── types/                 # TypeScript types
```

## Key Files

- `src/lib/bfl.ts` - BFL API integration (endpoints, polling, request building)
- `src/lib/anthropic.ts` - Claude Haiku image analysis
- `src/hooks/usePromptParser.ts` - @ syntax parsing and expansion
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

- `reference_images` - User's reference image library
- `generations` - Generation history with prompts and outputs

## BFL API Notes

- Endpoints: `/v1/flux-2-pro`, `/v1/flux-2-max`, `/v1/flux-2-flex`
- Up to 8 reference images via `input_image`, `input_image_2`...`input_image_8`
- Async polling via `polling_url`, results expire in 10 minutes
- Auth via `x-key` header

## Core Features

1. **Reference Upload** - Drag-drop with Claude Haiku auto-analysis
2. **@ Syntax Editor** - Type @ for reference dropdown, expands to "image N" format
3. **Preview Panel** - Shows expanded prompt FLUX receives
4. **Model Selector** - Switch between pro/max/flex
5. **History** - All generations saved with prompts and references
