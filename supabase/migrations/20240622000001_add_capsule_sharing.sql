-- Add sharing columns to capsules
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Generate share tokens for existing capsules (uses built-in gen_random_uuid, no extensions needed)
UPDATE capsules SET share_token = substr(replace(gen_random_uuid()::text, '-', ''), 1, 16) WHERE share_token IS NULL;

-- Make share_token NOT NULL after backfilling
ALTER TABLE capsules ALTER COLUMN share_token SET NOT NULL;
ALTER TABLE capsules ALTER COLUMN share_token SET DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_capsules_share_token ON capsules(share_token);

-- Public read policy: anyone can view public capsules
CREATE POLICY "Public capsules viewable by anyone"
  ON capsules FOR SELECT
  USING (is_public = true);

-- Public read policy: anyone can view media of public capsules
CREATE POLICY "Public media viewable by anyone"
  ON media_items FOR SELECT
  USING (capsule_id IN (SELECT id FROM capsules WHERE is_public = true));

-- Grant anon access for public viewing
GRANT SELECT ON public.capsules TO anon;
GRANT SELECT ON public.media_items TO anon;
