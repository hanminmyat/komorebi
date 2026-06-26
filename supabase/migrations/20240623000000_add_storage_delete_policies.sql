-- Allow authenticated users to delete their own files from audio bucket
create policy "Authenticated users can delete own audio"
on storage.objects for delete
using (
  bucket_id = 'audio'
  and auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Allow authenticated users to delete their own files from images bucket
create policy "Authenticated users can delete own images"
on storage.objects for delete
using (
  bucket_id = 'images'
  and auth.uid()::text = (string_to_array(name, '/'))[1]
);
