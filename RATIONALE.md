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

## 31 Oct 2026 (Settings: one Workouts box)

- **Programme and Workouts A–C now share one box** (Jack). Separate panels made four boxes for one idea; the Programme row heads the box and the workouts are collapsible rows under it. While Change is open the workout rows step aside so the switcher has the box to itself. First-time setup keeps its own layout ("My own" shows the grids as separate panels), since it has its own programme step.

## 31 Oct 2026 (layout review)

- **Drop-down header style renamed `.ddhead`.** The account drop-down (38e0358) reused the class name `dhead`, already used by the Today header, and its `padding:0` / `margin-left:auto` squashed the date and "% this week" against the card edge. The Today header kept its name as the original user.
- **Line-chart date labels count back from the latest week**, like the bar charts already did. Counting forward then forcing the last label made the last two collide ("19 Oct" over "26 Oct").
- **Check-ins grid gets a 320px rule** (iPhone with Display Zoom). Added one rule at the end rather than untangling the stack of earlier 440px rules, which work at 375–440px. Long habit names now end in "…".
- **Whole-hour workouts read "1 h", not "1 h 0 min".**

## 31 Oct 2026 (feedback)

- **Feedback is an icon left of the cog plus a Send feedback button at the bottom of Settings** (Jack's call). A fourth tab was rejected for space. The icon only fits from 375px (every iPhone at standard zoom) after trimming the tabs' padding from 14px to 12px; at 320px (Display Zoom) it hides, and the Settings button covers everyone.
- **People can send but not read feedback; no replies or history in the app.** That would be a messaging system; not worth it until feedback actually flows. The database fills in the sender's email so it can't be spoofed.
- **Privacy and forgotten passwords discussed; agreed order: password reset by emailed code first, then on-device photo encryption.** Encryption makes a forgotten password cost the photos, so the reset (and a recovery code) must exist first. A code, not a link, because a link opens in Safari, which is separate from the Home Screen app.
- **Feedback refinements (Jack):** Idea or Problem must be chosen before sending; the "goes privately to whoever runs the app" line was dropped; in Settings it's a centred red underlined "Send feedback" link at the bottom, not a section with a box.

## 31 Oct 2026 (email and forgotten passwords)

- **Forgot password = sign in with an emailed 6-digit code, then set a new password on the same card.** Supabase's reset email is built around a link, and the docs don't clearly support a typed recovery code; a link opens in Safari, separate from the Home Screen app. The email-code sign-in is fully documented and reused the old code-login path.
- **Email goes through a dedicated personal Gmail account with an app password**, not Resend. Resend (and every service that sends as you) needs a domain Jack would have to buy; Gmail passes inbox checks because Google sends it. A dedicated account keeps Jack's own address out and avoids the app password being cancelled when he changes his own Google password. Outlook was ruled out: personal Outlook accounts no longer allow password-based SMTP, which is all Supabase supports. Moving to a domain later is only an SMTP settings change.
- **Email confirmation at sign-up stays off.** Invite codes already gate sign-up; it would add a step for every friend.
- **First live reset email went to junk** (new Gmail, no sending history). Added "Not there? Check your junk folder." to the code step rather than moving to a domain straight away; domain + Resend is the fix if it persists. Server-side email failures now say "Couldn't send the email right now" instead of blaming the connection (the first SMTP misconfiguration looked like a network problem).

## 31 Oct 2026 (review photos)

- **Deleting a weekly-review photo is one tap on ×, with "Photo deleted. Undo" for 6 seconds** (Jack: the "Remove?" confirm didn't fit the 44px thumbnail and was pointless for a photo still waiting in the review). Undo instead of no safety net because the × is small and a slip would be permanent; the file is only removed from storage when the undo window ends, when another delete or upload starts, or when the app is left.
- **Photo encryption: with a recovery code** (Jack's choice).

## 31 Oct 2026 (photo encryption)

- **Progress photos are encrypted on the device before upload**, so the project owner (Jack) and anyone with database access see only scrambled files. Threat model, stated honestly: this stops casual browsing and leaks; it can't stop the owner shipping code that steals keys, since he controls the app.
- **Key design:** random per-person photo key, locked by the password and by a recovery code, stored in their own `docs` row (no new table or SQL). The unlocked key is cached on the device so already-signed-in devices don't need the password every open; signing out clears it.
- **Recovery code shown before the first encrypted photo, not at sign-up** (people who never add photos never see it). Required before the first photo (Not now cancels the upload). After a forgot-password reset, the code unlocks the key and re-locks it with the new password; without it, "Start fresh" makes a new key and old photos show as locked (deletable).
- **Prompts only when they matter:** a device without the key asks for the password on open only if the person has photos; otherwise at their first upload.
- **Files are labelled image/jpeg** so the existing bucket (image types only) accepts them without a schema change for Jack to run.
- **Older plain photos are encrypted in place** the first time the key is available and a recovery code is saved.

## 31 Oct 2026 (end-of-evening sweep)

- **Sign-in cards now shrink to the screen** (`#login` grid column `minmax(0,1fr)`, inputs `min-width:0`). They sized to the inputs' natural width and overflowed by ~25px at 320px (Display Zoom); this predated tonight.
- **Invite code box lost its placeholder**: it was cut off at 320px, and the line above already says to enter the code you were given.

## 1 Nov 2026 (test clock)

- **The app test suite now runs on a fixed calendar.** Boots without a date used the real clock, so the suite only passed during the week of Mon 26 Oct: on Sunday 1 Nov (a cardio day) Z1 found no Start button and crashed, and from Mon 2 Nov check 5 fails. Undated boots now start at Sat 31 Oct 2026 12:00 and tick forward in real time (the W4/W5 timer checks busy-wait on real time, so a frozen clock was rejected). Dated boots stay frozen as before.

## 1 Nov 2026 (Today vs the grid)

- **Prep is ticked in the check-ins grid only; Today's prep lines are reminders** (Jack). Today showed prep tick boxes that duplicated the grid's. Keeping them for convenience was rejected: Jack visits the grid daily for habits anyway, so one place to tick is more consistent, and it matches taking habits out of Today earlier. Each line shows To do/Done and tapping it scrolls to that day's box in the grid with a short green ring (it doesn't tick, or it would be a tick box again). If the grid is on another week, it jumps back to this week first.
- **The grid's Review row is gone** (Jack). It was a shortcut box, not a tick, and the review panel directly below already shows To do/Done for every week. The review still counts toward the weekly targets.
- **Today's review row is one line** ("Weekly review" + Open/View). The "Weight, photos, three questions" hint wrapped to three lines and made Sunday's box the longest of the week; the review panel itself explains what's in it.
- **Revised the same morning: every "Also today" line is the same** (Jack). Name on the left, To do/Done/Late on the right, then a › arrow; the whole line is the tap target, no Open button. Prep lines jump to the grid box, review lines open the review. The arrow (same as the review panel header's) was kept so a line reads as tappable without a button.
- **The weekly review is closed by default on review day** (Jack). Auto-opening made sense when the panel was the only way in; now Today's Weekly review line opens it, so the usual route costs no extra tap and the page isn't a long form all day. A past week whose review was never done still opens, since that's why you'd go there.
- **Every "Also today" line is at least 50px tall** (Jack: Weekly review didn't look centred). A one-line line was 32px with its text 5px under the divider, so it looked pushed up against the line above and was a smaller tap target; now it centres in the same band as the two-line prep lines.
- **When "Also today" ends the Today box, the box's bottom padding drops to 2px** (Jack spotted a gap). The last line's 50px band already leaves ~13px under its text, so the box's 14px padding doubled it; days without the list keep the normal padding.
- **A stuck GitHub Pages deployment silently blocked two deploys** (GitHub reported 70db976 as still in progress though its record showed success). Fix was cancelling the queued re-run and pushing an empty commit. Lesson: after pushing, check `gh run list` shows the Pages run as success before telling Jack it's live.

## 1 Nov 2026 (starter week and late reviews)

- **The week someone joins is a "starter week" scored from their first day** (Jack). Before, it was scored as a full week: a Thursday starter maxed out around 40%, "Missed" listed days before they joined, and Monday nagged about a review of a week they barely had. Hiding the score in week one was considered and rejected by Jack: the tracker and % are the point of the app, so the first week should work like every other week. Pro-rating targets (protein x/4, gym days left) was chosen so 100% is reachable; the header says "starter week" so smaller numbers explain themselves. Its % isn't comparable with a full week, so the chart shades it and the average skips it.
- **The starter review is always offered when review day falls on or after the start, with no cut-off day** (Jack: no arbitrary date). It's framed as a baseline and a look ahead (starting photos; "What might get in the way next week?"; "Your focus for your first full week?") so it makes sense after one day. If review day is before the start in that week (e.g. a Wednesday review, joined Thursday), the first review is the next one. "Starting weight" was tried as the label but wrapped in its narrow column; it stays "Weight".
- **The late-review nudge is the day after review day, once; then the review is missed for its week** (Jack agreed). It was hard-wired to Monday, so a Wednesday review was nudged five days late and a Monday review never. Rolling a missed review into the next week was rejected: it would mix two weeks' scores.
- **The hosted suite runs on a fixed Monday (26 Oct 2026)** with one clock offset shared by every page; per-page clocks made the second "device" run behind the first, so its newer change lost the sync. Its intermittent H18 failure was the test typing within 30 ms of opening sign-up, before the form moves focus to the email box; the test now pauses 150 ms.
- **Push in batches, and only after the hosted suites are clean** (Jack). Five pushes in an hour tripped GitHub Pages ("in progress deployment") and two deploys were rejected.

## 1 Nov 2026 (early days: empty charts)

- **Charts with nothing to show fold into one note per section** (Jack's option: tidy, but one line per section rather than per chart). A new user's Progress tab was ~1,900px of five dashed "appears once…" boxes; now ~1,000px with headings kept, so the shape of the page still shows. A single "what's coming" checklist card with unlock counts was offered (Claude's first pick) and passed over for this simpler version; faint example charts were rejected (sample data reads as your own).
- **Training tab: one note until anything is logged; Exercise progress hidden until then, and its exercise menu hidden until a lift has data.** The menu listed the programme's 16 exercises, all "no data yet".
- **The check-ins chart stays visible from day one** (it's live), with "Your first bar fills as you tick things off" until there's a second week.
- **Wording only names what applies**: no strength items with no weights sessions, no cardio item with cardio off.
