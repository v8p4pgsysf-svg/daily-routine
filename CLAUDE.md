# Daily Routine — notes for Claude

A personal health and fitness tracker (daily check-ins, weekly review, strength and cardio logging, progress charts) used by Jack, and optionally his girlfriend and friends. It runs as a home-screen web app.

## How it fits together
- `src/weekly-routine.html` is the single source of the app. The same page also runs as Jack's Claude artifact, where it uses Claude's storage (`window.claude.use(...)`).
- `docs/` is the live app on GitHub Pages: https://v8p4pgsysf-svg.github.io/daily-routine/
  - `docs/host.js` signs people in (email and password, through Supabase Auth). It then supplies the same `db` / `user` / `assets` / `downloads` interface the page expects, backed by Supabase. Finally it runs the page's script, which `tools/build.py` embeds as `<script type="text/plain" id="app-src">`.
  - `docs/config.js` holds the Supabase URL and publishable key. These are public by design.
  - `docs/supabase.js` is a vendored copy of @supabase/supabase-js 2.117.3 (UMD).
- Supabase project `xneuqsjqhlzhpqmcacst` (London) holds all user data.
  - The `public.docs` table has one row per record. It has RLS, and each person sees only their own rows.
  - Photos live in a private `photos` bucket, under `<user id>/<photo id>`.
  - `supabase/schema.sql` sets all of this up and is safe to re-run.
- Accounts: people sign up themselves in the app (email + their own password), but only if their email is in `public.invites`. A `before insert` trigger on `auth.users` enforces this, so it can't be bypassed (`supabase/invites.sql`). Email confirmation is off; the app sends no emails. The page hides hosted-only UI (import, account section) unless `window.__routineHost` exists.

## Making a change
1. Edit `src/weekly-routine.html`.
2. Run the tests: `node tests/app.test.js src/weekly-routine.html`. This needs `npm i jsdom`, and all checks must pass.
3. Rebuild: `python3 tools/build.py`. This rewrites `docs/index.html` and `docs/sw.js`; the new cache version makes phones pick up the update.
4. Commit and push to `main`. GitHub Pages redeploys in a minute or two.
5. If Jack still uses the Claude artifact version, republish it too. Ask him first.

## Jack's preferences for this app
- Phone-first: low friction, no duplicate inputs, consistent spacing, readable on iPhone.
- Opinionated suggestions, with honest trade-offs.
- Test before shipping. Check the layout at 390px wide in both light and dark.
