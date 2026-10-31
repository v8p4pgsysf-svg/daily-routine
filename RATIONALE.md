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
