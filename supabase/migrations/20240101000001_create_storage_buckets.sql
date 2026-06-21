insert into storage.buckets (id, name, public)
values ('audio', 'audio', true);

insert into storage.buckets (id, name, public)
values ('images', 'images', true);

create policy "Authenticated users can upload audio"
on storage.objects for insert
with check (
  bucket_id = 'audio'
  and auth.role() = 'authenticated'
);

create policy "Anyone can view audio"
on storage.objects for select
using (bucket_id = 'audio');

create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
  bucket_id = 'images'
  and auth.role() = 'authenticated'
);

create policy "Anyone can view images"
on storage.objects for select
using (bucket_id = 'images');
