-- FLUX Studio Database Schema
-- Run this in your Supabase SQL Editor

-- Reference images library
CREATE TABLE IF NOT EXISTS reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generation history
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_raw TEXT NOT NULL,
  prompt_expanded TEXT NOT NULL,
  reference_image_ids UUID[] DEFAULT '{}',
  output_image_url TEXT NOT NULL,
  output_storage_path TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'flux-2-pro',
  seed INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reference_images
CREATE POLICY "Users can view own references"
  ON reference_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own references"
  ON reference_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own references"
  ON reference_images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own references"
  ON reference_images FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for generations
CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON generations FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reference_images_user_id ON reference_images(user_id);
CREATE INDEX IF NOT EXISTS idx_reference_images_created_at ON reference_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- Storage buckets setup (run in Supabase Dashboard > Storage)
-- 1. Create bucket "references" with public access
-- 2. Create bucket "outputs" with public access

-- Storage policies for "references" bucket
-- In Supabase Dashboard > Storage > references > Policies:
-- SELECT: Allow authenticated users to read their own files
-- INSERT: Allow authenticated users to upload to their own folder
-- DELETE: Allow authenticated users to delete their own files

-- Storage policies for "outputs" bucket
-- SELECT: Allow authenticated users to read their own files
-- INSERT: Allow authenticated users to upload to their own folder (via service role)
-- DELETE: Allow authenticated users to delete their own files
