# Handover: Daily Routine app
Updated: 2 Nov 2026, morning (planning only, no code changes).

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

## Next (agreed with Jack, 2 Nov morning; in this order)
1. **Story and name** (one small batch):
   - Rename the app **Weekly Routine** (was Daily Routine): page title, sign-in heading, manifest `name` (and `apple-mobile-web-app-title`/`short_name` stay "Routine"). Don't rename the repo.
   - Tagline **"Plan your week. Train and tick off habits. Review how it went."** on the sign-in screen and under "Welcome" in setup (replacing or leading the current "Set up your routine in a few quick steps…" line).
   - Leftover: the Progress check-ins chart tooltip still says "x/7 targets"; make it match "% of check-ins".
2. **Own domain** (Jack: next step). Do it **before inviting anyone**: a new domain is a new origin, so anyone already using the github.io address loses their device sign-in, cached photo key (`routine-pk`) and Home Screen install, and must reinstall and sign in again (data is safe in Supabase). GitHub Pages custom domain (CNAME in `docs/`), then check Supabase Auth site URL / allowed redirects. The same domain unlocks Resend for reset emails (parked: Gmail SMTP emails land in junk).
3. **Pre-invite checks**: their email in `public.invites` (or the invite code); a forgot-password test to see if the email still goes to junk; send the link with "Open in Safari, then follow the Add to Home Screen steps".
4. **Watch session**: first invitee sets it up for themselves while Jack watches for ten minutes without helping; note every pause or wrong tap (programme and planned days, first tick, the %, starting a workout and reading "3 × 6–8", finding the review). End by asking "What would you tell a friend this app is for?" A mid-week start also tests the starter week. Then a week of real use, with feedback via the speech-bubble button (Table Editor → feedback).
5. **Backup nudge**: decide after that, since other people's data will be in the app (one free Supabase project; encrypted photos can only be saved by each person's own Export).

## Decided (2 Nov morning, see RATIONALE)
- One full app, pitched as a weekly routine with training at its heart. No three-way "training / habits / both" question at sign-up for now; the quiet ways out stay (0 weights = habits only; habits can be switched off).

## Parked until there's evidence
- Backup nudge and "Other activity": Jack chose to leave both for now (1 Nov evening).
- Feedback alerts (in-app inbox only Jack can read was Claude's pick). Wait until feedback flows.
- Domain + Resend, if friends' reset emails keep landing in junk.
