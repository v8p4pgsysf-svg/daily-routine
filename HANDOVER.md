# Handover: Daily Routine app
Updated: 1 Nov 2026, end of morning session.

## Current goal
Polish the hosted Daily Routine app (GitHub Pages + Supabase) so Jack uses it daily on his iPhone and can invite his girlfriend and friends. The must-haves before sharing are done; this morning focused on the first-week experience for new people.

## Read first
`CLAUDE.md` (architecture, single-source lists, how to ship, starter week, early-days notes). `src/weekly-routine.html` is ~236 KB in one file: grep for the part you need. `RATIONALE.md` before reversing any past decision.

## Shipped this session (all live; all tests green)
- Today: "Also today" lines share one pattern (name, To do/Done/Late, ›; whole line tappable); prep is ticked in the grid only; the grid's Review row is gone; the review panel is closed by default.
- Starter week for new people (targets fitted to the days left; Starter review; frozen once past), and the late-review nudge on the day after review day.
- Early days: empty charts fold into one note per section on Progress; Training shows one note until something is logged.
- Weekly review shown as Recommended in Settings/setup; Progress says nothing about it when it's off. Settings keep keys from newer versions.
- Habits-only people (no weights, no cardio): two tabs, no Rest card, setup skips planned days.
- Workout screen: + Set, Remove set, + Add exercise, Remove (today only; programme untouched). Programme switch keeps chosen gym days.
- Tests: the app suite and all hosted suites run on fixed calendars; hosted setup is one command (`tests/hosted/setup.sh`); flaky sign-up and photo-encryption races fixed.

## Testing
- App: `npm i jsdom` somewhere, then `NODE_PATH=<that>/node_modules node tests/app.test.js src/weekly-routine.html` (234 checks).
- Hosted: `tests/hosted/setup.sh <folder>` then run the suites there (`run.py` 57, `photo-encryption.py` 27, `feedback.py` 20, `forgot-password.py` 18, `home-screen.py` 17, `review-photos.py` 9, `settings-workouts.py` 7; sweeps `layout-review.py`, `screens-sweep.py`). `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.
- Opening `src/weekly-routine.html` directly shows the photo viewer overlay, because only the build adds `[hidden]{display:none!important}`. Add that style when screenshotting the source.
- Claude can't reach the live site or Supabase from the session; Jack checks live behaviour on his phone.

## Working with Jack
- Discuss options before design changes; he decides. Send short visible updates (SendUserMessage) during anything longer than a couple of minutes: text between tool calls isn't shown to him.

## Next (not started; Jack hasn't chosen)
0. Decide on an "Other activity" kind (pilates, classes, sport) with its own target and row; see RATIONALE (habits only).
1. Backup nudge: "Last backup: X ago" in the Sunday review with one-tap Export (all data is in one free Supabase project; a server-side dump to GitHub was rejected for friends' privacy).
2. 320px tidy-ups (all predate this session): Settings "3-day full body" and "Signed in as …" truncate; in a workout, "Set 1" wraps onto two lines.

## Parked until there's evidence
- Feedback alerts (in-app inbox only Jack can read was Claude's pick). Wait until feedback flows.
- Domain + Resend, if friends' reset emails keep landing in junk.
