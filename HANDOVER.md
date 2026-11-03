# Session Handover: Weekly Routine app
Generated: 3 Nov 2026 (evening)
Source: chat of 3 Nov 2026. Check files on disk rather than trusting this summary.

## Current Goal
Get the hosted app (GitHub Pages + Supabase) ready for Jack to invite his girlfriend and friends. The own domain is the next real step and must come before any invites.

## Live as of 3 Nov
Up to 7 weights days (A–G, dropdown); cardio time as min : sec; km/mi setting; commas in number boxes; two photo-encryption test flakes fixed. CLAUDE.md describes each; RATIONALE.md has the why. `main` is clean and matches what's deployed.

## Stated Preferences
- Discuss options and give an honest view before any design change; Jack decides.
- Send a short update if anything takes more than a couple of minutes (SendUserMessage). Run the full suite once at the end, not twice.
- Branch for work in progress; screenshots at 390px light and dark and 320px before UI changes go live; push in batches only when tests are clean; confirm the deploy before saying it's live.
- Names consistent everywhere; short labels only where space is fixed.

## Open Threads
- **Domain (next step, waiting on Jack)**: Claude's advice `weeklyroutine.app` at Cloudflare Registrar, fallback `weeklyroutine.co.uk`. Then CNAME in `docs/`, DNS "DNS only", Supabase Auth site URL and redirects, reset-email DNS. A new origin means existing installs reinstall and sign in again.
- **Stranger following a shared card's link** (decide with the domain): "Request an invite" on sign-in (Claude's pick) or a line saying to ask whoever shared it.
- **Two history entries open at once**: Jack saw it once; ask what he tapped before and reproduce.
- **Possible later**: "Copy Workout A" for people repeating a workout across 5–7 days; a cardio share card (would show 32:30); "Other activity"; feedback alerts; a backup nudge.
- **Stale branches on GitHub** (Claude can't delete, 403): history-compact, history-fit, history-rows, history-sets, programmes, share-card, training-tidy, weekly-routine-rename, test-photo-race, cardio-units-weights7. Leave `wip/accounts-units-habits`.

## Testing quick reference
`tests/run-all.sh` (about 8 minutes; `--quick` about 2) must end `ALL CLEAN`. Claude can't reach the live site or Supabase.

## Suggested First Move for Next Session
Ask Jack whether he has bought the domain yet (and which name).
