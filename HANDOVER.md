# Handover: Daily Routine app
Updated: 31 Oct 2026, end of the evening session.

## Current goal
Polish the hosted Daily Routine app (GitHub Pages + Supabase) so Jack uses it daily on his iPhone and can invite his girlfriend and friends. The two must-haves before wider sharing are done: forgotten-password reset and private (encrypted) progress photos.

## Read first
`CLAUDE.md` (architecture, single-source lists, how to ship). `src/weekly-routine.html` is ~230 KB in one file: grep for the part you need. `RATIONALE.md` before reversing any past decision.

## Shipped this session (all live; all tests green)
- Home Screen card on phone browsers (same on iPhone/Android; form waits behind "Continue in … instead").
- Settings: Programme + Workouts A–C in one box.
- Layout fixes: Today header padding (class clash), chart date labels, 320px check-ins grid, "1 h" durations, sign-in cards fitting at 320px.
- Feedback: icon left of the cog (375px+) and a red "Send feedback" link at the bottom of Settings; Idea/Problem required; `public.feedback` (Jack has run the SQL; it works).
- Forgot password by emailed 6-digit code, via a dedicated Gmail (app password) as Supabase custom SMTP. Works live; first email landed in junk, so the code step says to check junk.
- Weekly review photos: × deletes in one tap with Undo.
- Photo encryption with a recovery code. Checked live: a downloaded file from Storage won't open.

## Testing
- App: `npm i jsdom` somewhere, then `NODE_PATH=<that>/node_modules node tests/app.test.js src/weekly-routine.html` (179 checks).
- Hosted: follow `tests/hosted/README.md`. Suites: `run.py` (56), `home-screen.py`, `feedback.py`, `forgot-password.py`, `review-photos.py`, `photo-encryption.py`, plus the visual sweeps `layout-review.py` and `screens-sweep.py`. Playwright + Chromium: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. The mock's email code is always 123456.
- Claude can't reach the live site or Supabase from the session; Jack checks live behaviour on his phone and in the dashboard.

## Open ideas (not started; Jack hasn't chosen)
- **Feedback alerts** (Jack paused this). Options discussed: (1) in-app feedback inbox only Jack's account can read, with a dot on the icon (Claude's pick: one SQL policy, no third parties); (2) email per message via a Supabase Edge Function + the app's Gmail on port 465 (Supabase blocks 25/587; 465 unconfirmed); (3) ntfy push without message text.
- Backup nudge: "last backup: X ago" in the weekly review, since Export is manual.
- If reset emails keep landing in junk for friends: a domain + Resend (only Supabase SMTP settings change).
