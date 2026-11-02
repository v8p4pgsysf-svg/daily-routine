# Handover: Weekly Routine app
Updated: 2 Nov 2026, midday.

## Current goal
Get the hosted app (GitHub Pages + Supabase) ready for Jack to invite his girlfriend and friends. Step 1 (name and story) is shipped; the own domain is next and must come before any invites.

## Read first
`CLAUDE.md` (architecture, single-source lists, how to ship, starter week, Welcome page). `src/weekly-routine.html` is one big file: grep for what you need. `RATIONALE.md` before reversing any past decision.

## Shipped this session (2 Nov midday; all tests green)
- Renamed to Weekly Routine; sign-in shows "Plan your week. Train and tick off habits. Review how it went."
- Setup opens on a Welcome page: three closed drop-downs, a pinned Next that opens each in turn and becomes Get started; weight leads the next page.
- Progress check-ins tooltip says "check-ins", not "targets".
- run.py waits for the sign-out reload before signing back in (was an intermittent failure).

## Testing
- App: `npm i jsdom` somewhere, then `NODE_PATH=<that>/node_modules node tests/app.test.js src/weekly-routine.html`.
- Hosted: `tests/hosted/setup.sh <folder>` then run the suites there (`run.py` 69, plus `photo-encryption.py`, `feedback.py`, `forgot-password.py`, `home-screen.py`, `review-photos.py`, `settings-workouts.py`; sweeps `layout-review.py`, `screens-sweep.py`). `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. Any suite that does setup must click Next three times on the Welcome page, then Get started (`set-next`).
- `forgot-password.py` failed once at its sign-out step this session and passed every rerun; if it recurs, give it the same settle wait as run.py's `sign_out_done`.
- Claude can't reach the live site or Supabase; Jack checks live behaviour on his phone.

## Working with Jack
- Discuss options before design changes; he decides. Short visible updates (SendUserMessage) during anything longer than a couple of minutes. Show screenshots (390 light/dark, 320) before pushing UI changes.
- Work in progress can sit on a branch (Pages only deploys `main`); merge to `main` in one push once Jack approves.

## Next (in this order)
1. **Own domain** (Jack is buying it and will say the name). Claude's advice: `weeklyroutine.app` at Cloudflare Registrar (cost-price renewals, free DNS), falling back to `weeklyroutine.co.uk`; avoid cheap novelty TLDs since the same domain will send reset emails via Resend. Then: CNAME in `docs/`, DNS records at the registrar set to "DNS only" (grey cloud) so GitHub can issue the certificate (.app is HTTPS-only, so it won't load until then), Supabase Auth site URL and redirects, Resend DNS records. A new domain is a new origin: existing installs must reinstall and sign in again (data is safe); the github.io link redirects.
2. **Pre-invite checks**: their email in `public.invites` (or the invite code); a forgot-password test to see if the email still lands in junk; send the link with "Open in Safari, then follow the Add to Home Screen steps".
3. **Watch session**: first invitee sets it up while Jack watches for ten minutes without helping; note every pause (including whether people read the Welcome points or tap straight through). End with "What would you tell a friend this app is for?" Then a week of real use with feedback via the speech-bubble button.
4. **Backup nudge**: decide after that.

## Parked until there's evidence
- Backup nudge and "Other activity" (1 Nov).
- Feedback alerts; wait until feedback flows.
