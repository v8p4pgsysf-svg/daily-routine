# Handover: Daily Routine app
Updated: 1 Nov 2026, morning session.

## Current goal
Polish the hosted Daily Routine app (GitHub Pages + Supabase) so Jack uses it daily on his iPhone and can invite his girlfriend and friends. The must-haves before sharing (forgotten-password reset, encrypted photos) are done; next is real use and inviting the first people.

## Read first
`CLAUDE.md` (architecture, single-source lists, how to ship). `src/weekly-routine.html` is ~230 KB in one file: grep for the part you need. `RATIONALE.md` before reversing any past decision.

## Shipped this session (all live; all tests green)
- App test suite runs on a fixed calendar (it had silently expired: only passed in the week of 26 Oct).
- Today's "Also today" lines all share one pattern (name, To do/Done/Late, ›; whole line tappable). Prep is ticked in the grid only: its line jumps to the box. The grid's Review row is gone. The review panel is closed by default on review day.

## Testing
- App: `npm i jsdom` somewhere, then `NODE_PATH=<that>/node_modules node tests/app.test.js src/weekly-routine.html` (185 checks).
- Hosted: follow `tests/hosted/README.md`. `mock-supabase.js` must sit next to the scripts as well as in `site/`, and `node_modules/jszip` must be in the same folder (npm installs into the nearest parent with a package.json). Playwright + Chromium: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. The mock's email code is always 123456.
- Opening `src/weekly-routine.html` directly (outside the hosted build) shows the photo viewer overlay, because only the build adds `[hidden]{display:none!important}`. Add that style when screenshotting the source.
- `photo-encryption.py` sometimes stalls in the forgot-password steps (waiting for `#pk-none` or `#pk-rc`); it did so on the 31 Oct build too, and reruns pass 27/27. Worth fixing the wait if it keeps happening.
- Claude can't reach the live site or Supabase from the session; Jack checks live behaviour on his phone and in the dashboard.

## Next (Claude's suggested order; Jack hasn't chosen)
1. Backup nudge: "Last backup: X ago" in the Sunday review with one-tap Export. All data sits in one free Supabase project with no downloadable backups (as far as known); a server-side dump to GitHub was rejected because it would put friends' health data in Jack's repo.
2. `tests/hosted/setup.sh` so the hosted suites run with one command.

## Parked until there's evidence
- Feedback alerts (options: in-app inbox only Jack can read, Claude's pick; Edge Function email via Gmail port 465; ntfy push). Wait until feedback actually flows.
- Domain + Resend, if friends' reset emails keep landing in junk.
