-- Make storage buckets private (signed URLs required for access)
UPDATE storage.buckets SET public = false WHERE id IN ('audio', 'images');

-- Remove public SELECT policies (no longer needed — signed URLs bypass RLS)
DROP POLICY IF EXISTS "Anyone can view audio" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
