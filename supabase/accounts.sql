-- Daily Routine: invite code + "Delete my account".
-- Paste into Supabase → SQL Editor → New query → Run. Safe to run more than once.
-- Run after schema.sql and invites.sql.

-- 1. The invite code, kept privately in the database (the app can't read it).
create table if not exists public.app_config (
  key   text primary key,
  value text not null
);
alter table public.app_config enable row level security;   -- no policies: only you, in the dashboard
revoke all on public.app_config from anon, authenticated;
insert into public.app_config (key, value) values ('invite_code', 'change-me') on conflict (key) do nothing;
-- To set or change the code: Table Editor → app_config → invite_code → edit "value".
-- Sign-ups by code stay closed while it's 'change-me'. Emails on the invites list always work.

-- 2. New accounts need an invited email OR the invite code (checked by the database, not just the app).
create or replace function public.only_invited_signups() returns trigger
language plpgsql security definer set search_path = '' as $$
declare code text;
begin
  if exists (select 1 from public.invites i where i.email = lower(new.email)) then return new; end if;
  select value into code from public.app_config where key = 'invite_code';
  if code is not null and lower(code) <> 'change-me' and length(trim(code)) > 0
     and lower(trim(coalesce(new.raw_user_meta_data->>'invite_code',''))) = lower(trim(code)) then
    return new;
  end if;
  raise exception 'not_invited' using hint = 'Use the invite code, or add this email to public.invites';
end $$;
revoke all on function public.only_invited_signups() from public, anon, authenticated;
drop trigger if exists only_invited_signups on auth.users;
create trigger only_invited_signups before insert on auth.users
  for each row execute function public.only_invited_signups();

-- 3. Delete my account: removes the signed-in person's records and login. (The app removes their photos first.)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  delete from public.docs where user_id = uid;
  delete from auth.users where id = uid;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
