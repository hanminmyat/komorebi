create type capsule_type as enum ('audio', 'photo', 'mixed');

create table capsules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  type capsule_type not null,
  created_at timestamptz default now() not null
);

create table media_items (
  id uuid primary key default gen_random_uuid(),
  capsule_id uuid references capsules(id) on delete cascade not null,
  type text not null check (type in ('audio', 'image')),
  url text not null,
  order_index integer not null,
  created_at timestamptz default now() not null
);

alter table capsules enable row level security;
alter table media_items enable row level security;

create policy "Users can view own capsules"
  on capsules for select
  using (auth.uid() = user_id);

create policy "Users can insert own capsules"
  on capsules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own capsules"
  on capsules for update
  using (auth.uid() = user_id);

create policy "Users can delete own capsules"
  on capsules for delete
  using (auth.uid() = user_id);

create policy "Users can view own media items"
  on media_items for select
  using (
    capsule_id in (
      select id from capsules where user_id = auth.uid()
    )
  );

create policy "Users can insert own media items"
  on media_items for insert
  with check (
    capsule_id in (
      select id from capsules where user_id = auth.uid()
    )
  );

create policy "Users can delete own media items"
  on media_items for delete
  using (
    capsule_id in (
      select id from capsules where user_id = auth.uid()
    )
  );

grant usage on schema public to authenticated;
grant all on capsules to authenticated;
grant all on media_items to authenticated;
