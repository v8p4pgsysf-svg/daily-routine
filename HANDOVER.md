# Handover: Daily Routine app
Updated: 1 Nov 2026, evening session.

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
- Settings → Photo recovery code explains first; a new code replaces the old one only on "I've saved it".
- Tests: the app suite and all hosted suites run on fixed calendars; hosted setup is one command (`tests/hosted/setup.sh`); flaky sign-up and photo-encryption races fixed.

## Testing
- App: `npm i jsdom` somewhere, then `NODE_PATH=<that>/node_modules node tests/app.test.js src/weekly-routine.html` (234 checks).
- Hosted: `tests/hosted/setup.sh <folder>` then run the suites there (`run.py` 57, `photo-encryption.py` 31, `feedback.py` 20, `forgot-password.py` 18, `home-screen.py` 17, `review-photos.py` 10, `settings-workouts.py` 7; sweeps `layout-review.py`, `screens-sweep.py`). `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.
- Opening `src/weekly-routine.html` directly shows the photo viewer overlay, because only the build adds `[hidden]{display:none!important}`. Add that style when screenshotting the source.
- Claude can't reach the live site or Supabase from the session; Jack checks live behaviour on his phone.

## Working with Jack
- Discuss options before design changes; he decides. Send short visible updates (SendUserMessage) during anything longer than a couple of minutes: text between tool calls isn't shown to him.

## Next
- Focus (Jack, 1 Nov evening): new-user clarity. Done in four batches (see RATIONALE 1 Nov evening entries). Claude's suggestion before changing more: watch the first invitee set up and use the app for ten minutes without help, then fix where they hesitate.
- Discussed, not built: a guided walkthrough (Claude advised against a tour; if needed, a three-line "How your week works" card replacing the first-day tip, also shown to mid-week joiners).

## Parked until there's evidence
- Backup nudge and "Other activity": Jack chose to leave both for now (1 Nov evening).
- Feedback alerts (in-app inbox only Jack can read was Claude's pick). Wait until feedback flows.
- Domain + Resend, if friends' reset emails keep landing in junk.
