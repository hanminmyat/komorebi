-- Convert stored full URLs to storage paths (for private bucket + signed URL support)
-- Extracts the path portion from URLs like:
--   https://xxx.supabase.co/storage/v1/object/public/images/abc/def/123.jpg
--   → abc/def/123.jpg

UPDATE media_items
SET url = regexp_replace(url, '.*/storage/v1/object/(?:public|sign)/(?:audio|images)/([^?]+).*', '\1')
WHERE url LIKE '%/storage/v1/object/%';
