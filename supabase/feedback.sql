-- Feedback: ideas and problems sent from the app (the speech-bubble icon, or Settings → Send feedback).
-- People can send feedback but never read it back; the owner reads it in the dashboard (Table Editor → feedback).
-- Safe to re-run.

create table if not exists public.feedback (
  id          bigint      generated always as identity primary key,
  user_id     uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  email       text        default (auth.jwt() ->> 'email'),   -- filled in by the database, so it can't be faked
  kind        text        check (kind in ('idea', 'problem')),
  message     text        not null check (char_length(message) between 1 and 2000),
  app_version text,
  device      text,
  created_at  timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- send only as yourself; there are no read, edit or delete policies, so nobody can read feedback through the app
drop policy if exists "send own feedback" on public.feedback;
create policy "send own feedback" on public.feedback
  for insert to authenticated with check (user_id = auth.uid());

-- only these columns can be written from the app (email, id and created_at are set by the database)
revoke all on public.feedback from anon, authenticated;
grant insert (user_id, kind, message, app_version, device) on public.feedback to authenticated;

-- newest first, for reading in the SQL Editor:
--   select created_at, email, kind, message, device, app_version from public.feedback order by created_at desc;
