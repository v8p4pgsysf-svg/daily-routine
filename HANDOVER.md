# Handover: Daily Routine app
Updated: 31 Oct 2026, after adding the Home Screen nudge.

## Current goal
Polish the hosted Daily Routine app (GitHub Pages + Supabase) so Jack uses it daily on his iPhone and can invite his girlfriend and friends.

## Read first
`CLAUDE.md` (architecture, single-source lists, how to ship). `src/weekly-routine.html` is ~220 KB in one file: grep for the part you need rather than reading it whole. `RATIONALE.md` before reversing any past decision.

## Last shipped
- Home Screen nudge on the sign-in page, same on iPhone and Android (see `CLAUDE.md`).
- Settings: Programme and Workouts A–C in one box (`secPresets(D, secLists(D,false,true))`). Check: `tests/hosted/settings-workouts.py`. Tests: 179 app, 56 end-to-end, 17 home-screen checks (`tests/hosted/home-screen.py`).
- Layout review fixes: Today header padding (class clash), chart date labels, 320px check-ins grid, "1 h" durations. Full sweep: `tests/hosted/layout-review.py`.

## Testing notes
- App tests: `npm i jsdom` somewhere, then `NODE_PATH=<that>/node_modules node tests/app.test.js src/weekly-routine.html`.
- End-to-end and home-screen: follow `tests/hosted/README.md`.
- Layout checks: Playwright + Chromium are in the workspace (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). Serve a copy of `docs/` with `mock-supabase.js` as `supabase.js`, sign in as `jack@example.com` / `Start-1234`, check at 390px in light and dark.

## Waiting on Jack
- Open the live link in Safari on a real iPhone (a private tab, so you see it as a newcomer) and follow the card through to the Home Screen app.
- Earlier live checks still open: a progress photo survives a reopen and shows under Progress; live sync between phone and computer.

## Open ideas (not started; Jack hasn't committed to them)
- Backup nudge: show "last backup: X ago" in the weekly review, since Export is manual.
- Forgotten password and email confirmation, once Jack sets up email sending in Supabase.
