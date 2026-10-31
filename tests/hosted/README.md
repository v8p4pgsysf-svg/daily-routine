# Hosted app end-to-end test

`run.py` drives the hosted app in Chromium (Playwright) against `mock-supabase.js`, a stand-in for supabase-js that enforces "own rows only" the way the real database's security rules do. It covers:

- first-time setup
- sign-in and sign-up with the invite list
- sync between two devices
- offline and back online
- backup import with photos
- password change and sign-out
- keeping one person's data from another

## To run

Also: `python3 home-screen.py` (same `site/` folder) checks the Add to Home Screen card on iPhone Safari, Instagram's browser, the Home Screen app, desktop and Android, at 390px.

1. Make a folder `site/` from `docs/`, then replace `site/supabase.js` with `mock-supabase.js` and set `site/config.js` to any URL and key.
2. Copy `run.py` and `routine-export.zip` (a made-up backup: 22 sessions, 1 photo) next to `site/`, and run `npm i jszip` there.
3. Run `python3 run.py`.
