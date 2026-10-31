-- Daily Routine: invite list. People on the list can create their own account in the app.
-- Paste into Supabase → SQL Editor → New query → Run. Safe to run more than once.

-- Emails allowed to sign up. Nobody can read this from the app; only you, in the dashboard.
create table if not exists public.invites (
  email      text primary key check (email = lower(email)),
  added_at   timestamptz not null default now()
);
alter table public.invites enable row level security;   -- no policies: the app can't see or change it
revoke all on public.invites from anon, authenticated;

-- Refuse any new account whose email isn't on the list (enforced by the database, not just the app).
create or replace function public.only_invited_signups() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.invites i where i.email = lower(new.email)) then
    raise exception 'not_invited' using hint = 'Add this email to public.invites first';
  end if;
  return new;
end $$;
revoke all on function public.only_invited_signups() from public, anon, authenticated;

drop trigger if exists only_invited_signups on auth.users;
create trigger only_invited_signups before insert on auth.users
  for each row execute function public.only_invited_signups();

-- To invite someone (or use Table Editor → invites → Insert row; type the email in lower case):
-- insert into public.invites (email) values ('name@example.com');
