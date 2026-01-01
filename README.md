# FLUX Studio

A workflow tool for FLUX.2's multi-reference image generation. Makes the multi-reference feature intuitive through smart uploads, @ syntax referencing, and persistent library management.

## Features

- **Smart Upload with Auto-Analysis** - Drop an image and AI automatically generates a name and description using Claude Haiku
- **@ Syntax for Natural Referencing** - Type `@` to open a dropdown of all reference images, select to insert a styled pill
- **Persistent Reference Library** - All uploaded references saved to Supabase, available across sessions
- **"What FLUX Sees" Preview** - Shows the expanded prompt that FLUX will receive
- **Generation History** - All outputs saved with their prompts and reference images
- **Reference Reordering** - Drag to reorder reference images (position matters for FLUX)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Storage, PostgreSQL)
- **APIs**: BFL API (FLUX.2), Anthropic API (Claude Haiku for image analysis)

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Create storage buckets:
   - `references` - For uploaded reference images (public)
   - `outputs` - For generated images (public)
4. Configure storage policies (see `supabase/schema.sql` for details)

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# BFL API - Get from https://bfl.ai
BFL_API_KEY=your_bfl_api_key

# Anthropic API - Get from https://console.anthropic.com
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign In** - Use magic link or Google OAuth
2. **Upload Reference Images** - Drag and drop images, they'll be auto-analyzed and named
3. **Write Your Prompt** - Use @ syntax to reference images (e.g., "A woman driving @ferrari through @night_city")
4. **Preview** - See the expanded prompt that FLUX will receive
5. **Generate** - Select your model and generate
6. **View History** - Access all past generations from the History page

## API Information

### FLUX.2 API (BFL)
- **Endpoints**: `/v1/flux-2-pro`, `/v1/flux-2-max`, `/v1/flux-2-flex`
- **Reference Images**: Up to 8 via `input_image`, `input_image_2` ... `input_image_8`
- **Image Format**: Base64 or URL, 64x64 to 4MP, multiples of 16
- **Auth**: `x-key` header with API key
- **Results**: Async polling via `polling_url`, URLs expire in 10 minutes

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main workspace
│   ├── history/page.tsx            # Generation history
│   ├── auth/login/page.tsx         # Login page
│   └── api/
│       ├── analyze-image/route.ts  # Claude Haiku image analysis
│       └── generate/route.ts       # BFL API wrapper
├── components/
│   ├── workspace/                  # Main workspace components
│   ├── history/                    # History view components
│   └── ui/                         # shadcn components
├── hooks/
│   ├── useReferences.ts            # Reference CRUD + state
│   ├── useGeneration.ts            # Generation state
│   ├── useHistory.ts               # History state
│   └── usePromptParser.ts          # @ syntax parsing
└── lib/
    ├── supabase/                   # Supabase clients
    ├── bfl.ts                      # BFL API client
    └── anthropic.ts                # Claude API client
```

## Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## License

MIT
