# Handover: Daily Routine app
Generated: 31 Oct 2026, from the chat "Health and fitness dashboard" (338 turns, compacted twice — anything below marked *confirm* should be checked with Jack, not assumed).

## Current goal
Polish the hosted Daily Routine app (GitHub Pages + Supabase) so Jack uses it daily on his iPhone and can invite his girlfriend and friends to set up their own routines.

## State of the code
- Read the files, not this summary: `CLAUDE.md` (architecture, single-source lists, how to ship), then `src/weekly-routine.html` as needed (~215 KB, single file — grep for the section you need rather than reading it whole).
- `docs/` is in sync with `src/` (check `git log` for the latest commit).
- 31 Oct afternoon: iPhone zoom on text boxes switched off (viewport `maximum-scale=1` in `tools/build.py`; pinch-zoom still works on iOS); tidy pass fixed reps boxes truncating "12–20", the weight empty-state sentence breaking, and the Train card not filling its width. Habits trimmed to protein, fruit & veg, sleep, steps, no alcohol, no nicotine (days target, default 7) + own habits (one-line add, daily only). Settings: Units moved into Account; password / sign out / delete sit behind the "Signed in as" drop-down; a one-line Programme row (name of the matching preset, or "Custom" once edited; Change opens a switcher with descriptions, exercise preview and a confirm step) sits above the A/B/C cards. Any drop-down opening near the bottom of the screen scrolls into view. End-to-end suite runs from `tests/hosted/` with the committed test backup.
- Shipped on 31 Oct: repo layout + Pages from `docs/`; invite-only self sign-up (email list or invite code); delete my account; kg/lb setting; first-time setup with weight step and protein default 1.6 g/kg; habit catalogue + up to 8 custom habits; instant open on weak signal; unsynced-change guard on sign-out; Claude artifact version retired and unpinned.
- Small UI changes on 30 Oct: page header title dropped; planned week and Today box say "Workout A/B/C" (Today box title follows the planned week); exercise list stays open when switching workouts.

## Waiting on Jack
- **Two live checks** the simulations can't prove: progress photo upload survives reopen and shows under Progress; live sync between phone and computer. *Confirm* whether done.
- Verified live 31 Oct: change password, delete my account, invite-code sign-up.
- Done 31 Oct: `supabase/accounts.sql` run and invite code changed.

## Open work for Claude
- **Later, once Jack sets up email sending in Supabase:** forgotten-password flow and email confirmation on sign-up. Not started; depends on Jack.

## Suggested first move
Clone the repo, run the app tests to confirm a green baseline, then ask Jack what he wants to work on.
