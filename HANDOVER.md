# Handover: Daily Routine app
Generated: 31 Oct 2026, 15:00, at the end of the chat "Health and fitness dashboard (part 2)". Last commit at handover: `71a4aa6`.

## Current goal
Polish the hosted Daily Routine app (GitHub Pages + Supabase) so Jack uses it daily on his iPhone and can invite his girlfriend and friends.

## Read first
`CLAUDE.md` (architecture, single-source lists, how to ship). `src/weekly-routine.html` is ~220 KB in one file: grep for the part you need rather than reading it whole. `RATIONALE.md` before reversing any past decision.

## Shipped this session (all live, all tests green: 179 app, 56 end-to-end)
- iPhone no longer zooms into text boxes (viewport `maximum-scale=1` in `tools/build.py`; pinch-zoom still works on iOS).
- Tidy pass: reps boxes fit "12–20"; Train card fills its width; weight empty-state reads as one sentence.
- Habits: protein, fruit & veg, sleep, steps, no alcohol, no nicotine (days target, default 7). Own habits: one-line add ("Add a habit, e.g. Water"), daily only, optional target.
- Settings: habits open the page; Units is a row in Account; change password / sign out / delete sit behind the "Signed in as …" drop-down; a one-line **Programme** row above Workouts A–C names the matching preset or "Custom", and Change opens a switcher with descriptions, exercise preview and a "Switch to …" confirm.
- Any drop-down that opens near the bottom of the screen scrolls into view (one shared handler, `revealKey` in the source).

## Testing notes
- App tests: `npm i jsdom` somewhere, then `NODE_PATH=<that>/node_modules node tests/app.test.js src/weekly-routine.html`.
- End-to-end: follow `tests/hosted/README.md`. A made-up backup (`tests/hosted/routine-export.zip`, 22 sessions, 1 photo) is committed so it runs anywhere.
- Layout checks: Playwright + Chromium are in the workspace (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). Serve a copy of `docs/` with `mock-supabase.js` as `supabase.js`, sign in as `jack@example.com` / `Start-1234`, check at 390px in light and dark.

## Waiting on Jack
- Two live checks: progress photo upload survives a reopen and shows under Progress; live sync between phone and computer. (Change password, delete account and invite-code sign-up are verified live; `supabase/accounts.sql` has been run.)

## Open ideas (not started; Jack hasn't committed to them)
- Backup nudge: show "last backup: X ago" in the weekly review, since Export is manual.
- Forgotten password and email confirmation, once Jack sets up email sending in Supabase.

## Suggested first move
Clone the repo, run the app tests for a green baseline, then ask Jack what he wants to work on.
