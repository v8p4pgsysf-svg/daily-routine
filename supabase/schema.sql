-- Daily Routine: database setup. Paste all of this into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

-- 1. One table holds every record (weeks, workouts, settings). Each row belongs to one person.
create table if not exists public.docs (
  user_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  col        text        not null,
  id         text        not null,
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, col, id),
  constraint docs_size check (pg_column_size(data) < 262144),
  constraint docs_col_owner check (col like 'data/users/' || user_id::text || '%')
);

-- Explicit access for signed-in people only (works whether or not "automatically expose new tables" is on).
revoke all on public.docs from anon;
grant select, insert, update, delete on public.docs to authenticated;

-- 2. Row-level security: people can only ever see or change their own rows.
alter table public.docs enable row level security;
drop policy if exists "docs: read own"   on public.docs;
drop policy if exists "docs: add own"    on public.docs;
drop policy if exists "docs: change own" on public.docs;
drop policy if exists "docs: delete own" on public.docs;
create policy "docs: read own"   on public.docs for select to authenticated using (user_id = (select auth.uid()));
create policy "docs: add own"    on public.docs for insert to authenticated with check (user_id = (select auth.uid()));
create policy "docs: change own" on public.docs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "docs: delete own" on public.docs for delete to authenticated using (user_id = (select auth.uid()));

-- 3. Live sync between your devices.
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- 4. Progress photos: a private bucket, one folder per person, 10 MB per photo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "photos: read own"   on storage.objects;
drop policy if exists "photos: add own"    on storage.objects;
drop policy if exists "photos: change own" on storage.objects;
drop policy if exists "photos: delete own" on storage.objects;
create policy "photos: read own"   on storage.objects for select to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: add own"    on storage.objects for insert to authenticated with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: change own" on storage.objects for update to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: delete own" on storage.objects for delete to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
