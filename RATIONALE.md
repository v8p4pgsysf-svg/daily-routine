# Daily Routine — Rationale Log

**What this file is:** why the app is the way it is — rejected alternatives, reversals and workflow decisions. Append-only: never edit or remove entries; add a new one to reverse an old one.

**What it is NOT:** current state. That lives in the code and `CLAUDE.md`.

---

## 31 Oct 2026 (backfilled from the original build chat)

- **Moved off the Claude artifact to GitHub Pages + Supabase.** The artifact couldn't give friends their own private accounts. The artifact version is now retired; don't republish it.
- **Sign-up is invite-only, not open.** Open sign-up was rejected: anyone finding the URL could create an account on Jack's free Supabase project. Invites work by email list or a shared invite code, enforced by a database trigger so the app can't bypass it.
- **Protein target is set once at setup (1.6 g/kg), not recalculated.** Silently changing a target when weight changes was judged confusing; people edit it themselves.
- **Header title dropped.** Considered "Routine", "Today", "Health & Fitness"; Jack chose no title to save space on the phone.
- **Publishing:** a GitHub access key pasted into chat was rejected (sits in chat history, expires). Manual upload was used until the GitHub connector was enabled; Claude now pushes directly.
- **Extra suggested programmes scrapped.** The 2-day full body, upper/lower, push/pull/legs and dumbbells-only drafts were dropped from the list by Jack; the two existing presets stay.
- **Habit list trimmed; own habits are daily.** Water and No nicotine removed from the built-in list (Jack doesn't want many; Water is now the example for adding your own). Own habits lost the days-a-week choice: it was invisible after adding and couldn't be edited, and almost every self-added habit is daily. Rejected keeping a days picker on each row for space. Can be re-added later without data loss (custom habits still store `target`).
- **Reversal: No nicotine is back** (same day). Jack wants it built in, on the same basis as No alcohol: a days-a-week target, default 7.
- **Suggested programmes moved to a "Programme" row above the workout cards.** As a card below Workouts A–C it read like another workout and didn't make clear it replaces them. The row names the current programme ("Custom" once edited, Jack's wording) and switching needs an explicit "Switch to …" confirm. Kept to one line to save space.

## 31 Oct 2026 (Home Screen nudge)

- **iPhone shows the Add to Home Screen steps before sign-in, and the form waits behind "Continue in Safari instead".** Safari can't be asked to install a site, so a banner with the steps is the only option. The gate comes before sign-in because a Home Screen app keeps its own sign-in, separate from Safari: anyone who signs in first then adds it has to sign in twice. A banner after sign-in was rejected for that reason. The skip is remembered so it never nags twice.
- **Android Chrome gets its own Install button, but the form stays visible.** Installed Chrome apps share the browser's sign-in, so there's nothing to gate.
- **Revised the same day: one experience on every phone.** Android now also shows the steps first with the form behind "Continue in the browser instead", rather than both at once: the form underneath competed with "open it from your Home Screen" and its auto-focus opened the keyboard over the steps. Android without an install prompt (Firefox, or Chrome before it offers one) gets the ⋮ menu steps instead of nothing.
- **Steps worded for any iOS version, not iOS 26.** "If you can't see it, tap ⋯ first" and "If you see Open as Web App, leave it on" cover old and new Safari without naming a version.
- **Dropped the separate-sign-in explanation and the "full screen, one tap away, stays signed in" pitch** (Jack). The order of the steps already gets people to sign in from the Home Screen app; the extra lines read as plumbing and sales copy.
