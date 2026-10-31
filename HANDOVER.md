# Handover: Daily Routine app
Generated: 31 Oct 2026, from the chat "Health and fitness dashboard" (338 turns, compacted twice — anything below marked *confirm* should be checked with Jack, not assumed).

## Current goal
Polish the hosted Daily Routine app (GitHub Pages + Supabase) so Jack uses it daily on his iPhone and can invite his girlfriend and friends to set up their own routines.

## State of the code
- Read the files, not this summary: `CLAUDE.md` (architecture, single-source lists, how to ship), then `src/weekly-routine.html` as needed (~215 KB, single file — grep for the section you need rather than reading it whole).
- Last commit `d5aee56` (31 Oct 14:09). `docs/` is in sync with `src/`.
- Shipped on 31 Oct: repo layout + Pages from `docs/`; invite-only self sign-up (email list or invite code); delete my account; kg/lb setting; first-time setup with weight step and protein default 1.6 g/kg; habit catalogue + up to 8 custom habits; instant open on weak signal; unsynced-change guard on sign-out; Claude artifact version retired and unpinned.
- Small UI changes on 30 Oct: page header title dropped; planned week and Today box say "Workout A/B/C" (Today box title follows the planned week); exercise list stays open when switching workouts.

## Waiting on Jack (*confirm* status before acting)
1. **Run `supabase/accounts.sql`** in the Supabase SQL Editor (invite code + delete-account function), then change the invite code from the placeholder `change-me`. Until then, invite-code sign-up and Delete account won't work live.
2. **Three live checks** the simulations can't prove: progress photo upload survives reopen and shows under Progress; live sync between phone and computer; Change password then sign back in.

## Open work for Claude
1. **Draft four more programmes for Jack to review before adding to `PRESETS`**: 2-day full body, 4-day upper/lower, 3-day push/pull/legs, 3-day dumbbells only. Send as a readable list first; don't add until approved. (Only "3-day full body" and "3-day glute focus" exist.)
2. **Later, once Jack sets up email sending in Supabase:** forgotten-password flow and email confirmation on sign-up. Not started; depends on Jack.

## Suggested first move
Clone the repo, run the app tests to confirm a green baseline, then ask Jack whether items 1–2 under "Waiting on Jack" are done before starting on the programme drafts.
