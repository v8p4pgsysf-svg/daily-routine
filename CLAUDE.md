# Daily Routine — notes for Claude

A personal health and fitness tracker (daily check-ins, weekly review, strength and cardio logging, progress charts) used by Jack, and optionally his girlfriend and friends. It runs as a home-screen web app.

## How it fits together
- `src/weekly-routine.html` is the single source of the app. It began as a Claude artifact, so it still talks to storage through a `window.claude.use(...)` interface. That interface is now supplied by `docs/host.js`. The old Claude artifact version is retired (31 Oct 2026), so don't republish it.
- `docs/` is the live app on GitHub Pages: https://v8p4pgsysf-svg.github.io/daily-routine/
  - `docs/host.js` signs people in (email and password, through Supabase Auth). It then supplies the same `db` / `user` / `assets` / `downloads` interface the page expects, backed by Supabase. Finally it runs the page's script, which `tools/build.py` embeds as `<script type="text/plain" id="app-src">`.
  - `docs/config.js` holds the Supabase URL and publishable key. These are public by design.
  - `docs/supabase.js` is a vendored copy of @supabase/supabase-js 2.117.3 (UMD).
- Supabase project `xneuqsjqhlzhpqmcacst` (London) holds all user data.
  - The `public.docs` table has one row per record. It has RLS, and each person sees only their own rows.
  - Photos live in a private `photos` bucket, under `<user id>/<photo id>`.
  - `supabase/schema.sql` sets all of this up and is safe to re-run.
- Accounts: people sign up themselves in the app (email + their own password), but only if their email is in `public.invites`. A `before insert` trigger on `auth.users` enforces this, so it can't be bypassed (`supabase/invites.sql`). An invite code also works: it's kept in `public.app_config` (`invite_code`), the app sends it as sign-up metadata, and the same trigger checks it (`supabase/accounts.sql`, which also adds `delete_my_account()`). Email confirmation is off; the app sends no emails. The page hides hosted-only UI (import, account section) unless `window.__routineHost` exists.

## Single sources: add things in one place
Each of these lives in one list in `src/weekly-routine.html`; everything else is derived from it. Never change an existing id or key once people have used it.
- `HABIT_CATALOG`: daily habits (protein, fruit & veg, sleep, water, steps, no alcohol, no nicotine). People can add up to 8 of their own (`settings.custom`, keys `x_…`). These feed setup, settings, the check-ins grid, counts, the review summary and exports.
- `EXERCISE_CATALOG`: exercises, each with a name, a short name for the key-lifts table, its weight step, and whether it's assisted. These feed the exercise picker, programmes, workouts, the progress dropdown, key lifts, lift status and exports. People's own exercises are stored in `settings.exNames`.
- `PRESETS`: suggested programmes. Jack's default programme is `DEFAULT_SETTINGS.workouts`, which is also the "3-day full body" preset.
- `CARDIO_CATALOG`: cardio types offered as chips. `counts:false` means a type is logged but not counted toward the weekly target (Walk).
- `PREP_INFO`: prep tasks. These feed setup, settings, Today, the planned week and the grid.
- `DAYS` / `DAYS_LONG` and `LETTERS` hold day names and workout letters.

## Habits, setup and settings
- Weights are stored in kg. `settings.unit` (kg/lb) only changes display and input; use `liftU`/`fromU`/`fmtLift`/`fmtBody`. Exports stay in kg.
- Setup asks for a weight first. It's saved as that week's weigh-in and sets the protein target (1.6 g per kg, rounded to 5 g).
- The settings page and the first-time setup share pieces: `habitRows`, `secCounts`, `secGrid`, `secLists`, `secPrep` and `secPresets`.
- Setup runs once, in the hosted app only. It starts after cloud data has loaded, and only when the person has no saved settings, no data and no `setupDone` marker. Finishing setup saves `setupDone: true` with their settings.
  - New people start from neutral defaults (`newcomerDraft`). Jack's routine stays the default only for the Claude version.
- Weights per week can be 0. In that case there's no Strength row, and Training offers cardio only.
- Suggested programmes live in `PRESETS`.

## Making a change
1. Edit `src/weekly-routine.html`.
2. Run the tests: `node tests/app.test.js src/weekly-routine.html`. This needs `npm i jsdom`, and all checks must pass. For sign-in, setup or sync changes, also run the hosted test in `tests/hosted/`.
3. Rebuild: `python3 tools/build.py`. This rewrites `docs/index.html` and `docs/sw.js`; the new cache version makes phones pick up the update.
4. Commit and push to `main`. GitHub Pages redeploys in a minute or two. Phones open the saved copy instantly, pick up the new version in the background, and show it on the next open.

## Session continuity
At the start of a session, if `HANDOVER.md` exists, read it before responding: it holds in-flight work and open threads from the last chat. Once that work is picked up, rewrite or delete it so it never goes stale. `RATIONALE.md` is an append-only log of why things were decided; check it before reversing a past decision.

## Jack's preferences for this app
- Phone-first: low friction, no duplicate inputs, consistent spacing, readable on iPhone.
- Opinionated suggestions, with honest trade-offs.
- Test before shipping. Check the layout at 390px wide in both light and dark.
