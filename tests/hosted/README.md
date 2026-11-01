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

Also: `python3 photo-encryption.py` walks every photo-encryption path: older photos secured, recovery code, storage holds only ciphertext, second device, password change, forgot password + recovery code, start fresh, new code, export, delete account.

Also: `python3 review-photos.py` checks deleting a weekly-review photo: one tap, Undo, and the file leaving storage only once Undo has gone.

Also: `python3 forgot-password.py` checks Forgot password end to end (code email, wrong code, resend, new password, old password refused).

Also: `python3 feedback.py` checks the feedback icon (shown from 375px, hidden at 320px), the sheet, sending, offline and Settings → Send feedback.

Also: `python3 screens-sweep.py` screenshots the sign-in, create account, forgot password, Home Screen, feedback, recovery code, unlock and Settings account screens at 390/375/320px into `sweep/` and lists anything that overflows. Run it with `layout-review.py` before shipping layout changes.

Also: `python3 layout-review.py` signs in, imports the sample backup and screenshots every tab and Settings at 390, 375 and 320px (light and dark at 390) into `review/`, listing anything that overflows its box. Run it before shipping layout changes.

Also: `python3 settings-workouts.py` checks the Settings Workouts box (Programme + Workouts A–C in one box) at 390px in light and dark, saving shots to `shots/`.

Also: `python3 home-screen.py` (same `site/` folder) checks the Add to Home Screen card on iPhone Safari, Instagram's browser, the Home Screen app, desktop and Android, at 390px.

1. Run `tests/hosted/setup.sh <folder>` (default `./hosted-run`). It copies the app into `<folder>/site/` with the mock in place of supabase-js, puts the suites and the sample backup next to it and installs jszip. Rerun it after `python3 tools/build.py`.
2. `cd <folder>` and run `python3 run.py` (or any suite above). If Chromium isn't found, set `PLAYWRIGHT_BROWSERS_PATH` (e.g. `/opt/pw-browsers`).

Every suite runs on a fixed calendar (Mon 26 Oct 2026, see `clock.py`), so results don't depend on the real date.
