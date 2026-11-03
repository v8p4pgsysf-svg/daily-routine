# Session Handover: Weekly Routine app
Generated: 3 Nov 2026
Source: current chat (2 Nov 2026). A long session: check files on disk rather than trusting this summary's details.

## Current Goal
Get the hosted app (GitHub Pages + Supabase) ready for Jack to invite his girlfriend and friends. Polish from 2 Nov is all live; the own domain is the next real step and must come before any invites.

## Output Files (pointers)

### src/weekly-routine.html
**Path**: /home/claude/daily-routine/src/weekly-routine.html (clone fresh: `git clone https://github.com/v8p4pgsysf-svg/daily-routine`)
**Type & shape**: single-file app, ~259 KB / 3,181 lines; built into `docs/index.html` by `tools/build.py`. Grep for what you need.
**Recent changes (2 Nov, all live, last commit 149649c)**: Weekly Routine name and sign-in tagline; setup Welcome page; updated suggested programmes; exercise renames and short labels (Barbell → BB, Dumbbell → DB; test EC1); "per leg"; share card; Training history rows ("Workout A" line, sets as one line under each full name, "Not done: …" line). CLAUDE.md describes each.
**Open work**: none in progress. `main` is clean and matches what's deployed.

**Note**: read the file and CLAUDE.md directly before reasoning about how anything works.

## Source References
- **CLAUDE.md** (authoritative): architecture, single-source lists, how to test and ship, current behaviour.
- **RATIONALE.md** (authoritative, append-only): why things are as they are, including the history layouts tried and rejected on 2 Nov. Now ~42 KB (~10k tokens): consider summarising older entries into a separate archive file if it keeps growing (don't edit existing entries).
- **tests/** (authoritative): app suite plus hosted suites, including the new `tests/hosted/share-card.py`.

## Stated Preferences
- "Discuss options and give me your honest view before any design change, and I decide."
- "Send me a short update if anything takes more than a couple of minutes." (Use SendUserMessage.)
- "Push in batches, only when all tests are clean, and confirm the deploy succeeded before telling me it's live."
- Show screenshots (390px light and dark, 320px) before pushing UI changes; keep work in progress on a branch until Jack says go.
- Names should be consistent everywhere; short labels only where space is fixed (setup summary, key-lifts table), never mixed into lists that use full names.

## Open Threads
- **Domain (next step, waiting on Jack)**: Jack is buying it and will say the name. Claude's advice: `weeklyroutine.app` at Cloudflare Registrar, fallback `weeklyroutine.co.uk`. Then CNAME in `docs/`, DNS records "DNS only" (grey cloud), Supabase Auth site URL and redirects, Resend DNS for reset emails. A new origin means existing installs reinstall and sign in again.
- **What a stranger following a shared card's link can do** (decide with the domain): "Request an invite" on sign-in (Claude's pick) or a line saying to ask whoever shared it. Sign-up is invite-only; no QR code (Jack); the card has no printed address until the domain exists.
- **Phone check for Jack**: share a workout once and confirm Save Image and Instagram still appear in the share sheet now that a link goes with the picture. If either is missing, drop `url`/`text` in `shareWorkout`.
- **Two history entries open at once**: Jack saw it once; the code allows one and a test agreed. Ask what he tapped before (View workout from Today? the scorecard? Share?) and reproduce.
- **Jack's own programme** reads "Custom" since the full-body preset changed; he can tap Change → Switch to 3-day full body (history stays).
- **Test flakes**: `photo-encryption.py` once timed out clicking setup's Start; `forgot-password.py` once at sign-out. Both passed every rerun. If either recurs, add a wait-until-enabled / settle step.
- **Stale branches on GitHub**: history-compact, history-fit (unused experiment), history-rows, history-sets, programmes, share-card, training-tidy, weekly-routine-rename (all merged or parked; Claude can't delete remote branches, a 403). `wip/accounts-units-habits` predates this session; leave it. Jack can delete the rest under Branches.
- **After the domain**: pre-invite checks, a watch session with the first invitee, then decide on a backup nudge. Parked until there's evidence: "Other activity", feedback alerts, a cardio share card.

## Testing quick reference
`tests/run-all.sh` (about 8 minutes; `--quick` about 2) rebuilds and runs everything with time limits; it must end `ALL CLEAN`. Claude can't reach the live site or Supabase.

## Done on 3 Nov (housekeeping, live)
Older rationale moved to `rationale/` (search, don't read); `tests/run-all.sh` added; email-code sign-in removed (email and password only; Forgot password unchanged); unused functions and ~5 KB of dead styles removed, with screenshots of every screen identical before and after.

## Suggested First Move for Next Session
Ask Jack whether he has bought the domain yet (and which name); if not, ask about the share-sheet check and the two-open history report before starting anything new.
