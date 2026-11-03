# Handover: Weekly Routine app
Updated: 2 Nov 2026, evening.

## Current goal
Get the hosted app (GitHub Pages + Supabase) ready for Jack to invite his girlfriend and friends. Step 1 (name and story) is shipped; the own domain is next and must come before any invites.

## Read first
`CLAUDE.md` (architecture, single-source lists, how to ship, starter week, Welcome page). `src/weekly-routine.html` is one big file: grep for what you need. `RATIONALE.md` before reversing any past decision.

## Shipped this session (2 Nov; all live, all tests green)
- Renamed to Weekly Routine; sign-in tagline; setup Welcome page (three closed points, pinned Next → Get started).
- Exercise progress: menu lists only logged lifts; "Building data on N lifts".
- Workout screen: "Last time you also did Set N" (never carried forward); swap/added notes on their own line ("Instead of …"); Today's done lines shortened.
- Suggested programmes rewritten to Jack's spec (all 3 sets; Leg Extension and Cable Chest Fly added; both Mon/Wed/Fri). Jack's own programme reads "Custom" until he taps Switch.
- Names: Flat/Incline Dumbbell Chest Press, Seated Leg Curl, Leg Press; every exercise has a short label (test EC1); "per leg" for lunges and split squats.
- Share card: an image of a finished workout, every set, from the saved message, history and the saved-workout screen; footer "Made with Weekly Routine"; the link travels alongside where the app keeps it.

## To check on Jack's phone
- Jack once saw two Training history entries open together; the code allows one, and a test with two workouts agreed. Ask what he tapped (View workout from Today? the scorecard? Share?) and reproduce.
- `photo-encryption.py` timed out once clicking setup's Start (passed three reruns); if it recurs, wait for the button to be enabled before clicking.
- Share a workout once: Save Image and Instagram should still appear in the share sheet now that a link goes with the picture. If either is missing, share the picture alone (drop `url`/`text` in `shareWorkout`).

## Testing
- App: `npm i jsdom` somewhere, then `NODE_PATH=<that>/node_modules node tests/app.test.js src/weekly-routine.html`.
- Hosted: `tests/hosted/setup.sh <folder>` then run the suites there (`run.py` 70, plus `share-card.py`, `photo-encryption.py`, `feedback.py`, `forgot-password.py`, `home-screen.py`, `review-photos.py`, `settings-workouts.py`; sweeps `layout-review.py`, `screens-sweep.py`). `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. Any suite that does setup must click Next three times on the Welcome page, then Get started (`set-next`).
- `forgot-password.py` failed once at its sign-out step this session and passed every rerun; if it recurs, give it the same settle wait as run.py's `sign_out_done`.
- Claude can't reach the live site or Supabase; Jack checks live behaviour on his phone.

## Working with Jack
- Discuss options before design changes; he decides. Short visible updates (SendUserMessage) during anything longer than a couple of minutes. Show screenshots (390 light/dark, 320) before pushing UI changes.
- Work in progress can sit on a branch (Pages only deploys `main`); merge to `main` in one push once Jack approves.

## Next (in this order)
1. **Own domain** (Jack is buying it and will say the name). With it: decide what a stranger who follows a shared card's link can do ("Request an invite" on sign-in, Claude's pick, or a line saying to ask whoever shared it); maybe print the short address on the card. Claude's advice: `weeklyroutine.app` at Cloudflare Registrar (cost-price renewals, free DNS), falling back to `weeklyroutine.co.uk`; avoid cheap novelty TLDs since the same domain will send reset emails via Resend. Then: CNAME in `docs/`, DNS records at the registrar set to "DNS only" (grey cloud) so GitHub can issue the certificate (.app is HTTPS-only, so it won't load until then), Supabase Auth site URL and redirects, Resend DNS records. A new domain is a new origin: existing installs must reinstall and sign in again (data is safe); the github.io link redirects.
2. **Pre-invite checks**: their email in `public.invites` (or the invite code); a forgot-password test to see if the email still lands in junk; send the link with "Open in Safari, then follow the Add to Home Screen steps".
3. **Watch session**: first invitee sets it up while Jack watches for ten minutes without helping; note every pause (including whether people read the Welcome points or tap straight through). End with "What would you tell a friend this app is for?" Then a week of real use with feedback via the speech-bubble button.
4. **Backup nudge**: decide after that.

## Parked until there's evidence
- Backup nudge and "Other activity" (1 Nov).
- Feedback alerts; wait until feedback flows.
