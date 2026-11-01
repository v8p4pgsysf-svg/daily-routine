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

## 1 Nov 2026 (review of the morning's work)

- **A past starter week is frozen with its fitted targets** (Jack: why leave it?). Fitting used the current gym and cardio days, so changing them later rewrote that week's targets, against the app's rule that past weeks keep their own plan. Now the snapshot taken when settings change stores the fitted targets. Claude had first proposed leaving it as cosmetic; Jack was right that history shouldn't move.
- **Accepted, not fixed: an old app version on a second device can drop `startedOn`** if the person saves settings there (old code doesn't know the key). Only possible during the first days of rollout, and the effect is the starter week reverting to full-week scoring.
- **Mid-week starters get the Starter week line instead of the first-day tip** (two intro lines stacked on day one). Monday starters have no starter week and keep the tip.
- **All hosted suites share one fixed clock (`tests/hosted/clock.py`) and are set up with `tests/hosted/setup.sh`.** The photo-encryption stall was the same race as the sign-up one (typing within 30 ms of the forgot-password card moving focus); the tests now pause 100 ms after those steps. The exercise-menu check (only the programme's exercises) is back, with a logged workout.
- **Deploy checks moved into CLAUDE.md's "Making a change"** so they survive handover rewrites.
- **Trends note shortened to match Training's** (Jack: too wordy). "Weight and check-in trends appear here as you log them" / "Your weight trend appears after your second weigh-in", instead of reusing each chart's own longer empty-state text.
- **Correction (Jack): the second-device `startedOn` risk wasn't "accepted"; it affects no one.** It needs someone with a start date (signed up after the starter-week release) who also opens a copy of the app saved before that release on another device and saves settings there. Jack has no start date, and new people's devices load the current version, so only a phone that opened the link before 1 Nov could hit it, in its first session. No change needed.

## 1 Nov 2026 (weekly review off; settings from newer versions)

- **With the weekly review off, Progress no longer mentions it** (Jack: no message in perpetuity). No weight wording in the Trends note, and no Photos section until there are photos. The case for the review is made where the choice is: Settings and setup show "Recommended" under Weekly review and, when it's off, "Your weight, photos and next week's focus come from the review. Off hides them." A "Recommended" pill on the right was tried first and rejected: it pushed the review day onto its own line.
- **Settings keep keys this version doesn't know** (`SETTINGS_KNOWN` in `normaliseSettings`), so an older copy of the app on another device can't drop a setting a newer version added (the `startedOn` case). Keys this version reads are still validated; the storage record's own `kind`/`id` are ignored. It protects settings added from now on; copies older than this release still drop unknown keys.

## 1 Nov 2026 (habits only)

- **No weights and no cardio = a habit tracker** (Jack chose this over keeping a Training tab for occasional logging). No Training tab, no Planned week (seven "Rest" days), and no "Rest · Training anyway?" card: Today opens with the day's tasks, or "Nothing planned today: tick your check-ins below" (not shown under the first-day tip, which says the same). Setup and Settings say "With no sessions, the app tracks your habits and the Training tab is hidden"; setup skips "When will you train?" and its dots count one step fewer. Someone who has logged sessions before keeps the Training tab, so their history stays reachable.
- **"Other activity" (pilates, classes, sport) is undecided.** Logging it as cardio "Other" was considered and judged not good enough by Jack: someone may do pilates and a run on the same day and want them counted separately. If it's built, it's a separate kind with its own target and row.

## 1 Nov 2026 (changing today's workout; gym days)

- **One-off changes happen inside the day's planned workout, not in a separate "free workout"** (Jack's idea, preferred over Claude's two-step plan). Structure stays the default: you start from A/B/C and change that day. Added: "+ Set" on every exercise, "Remove set" for a set added today (planned sets are skipped by leaving them unticked), and "+ Add exercise" (same picker as Swap; 3 × 8–12). An added exercise shows "added today" and Remove instead of Swap. Remove links hide while a ticked set would be lost. Nothing changes the programme; lift history is per exercise, so added lifts feed their own progress. The set count now includes added sets; "ready to add weight" still looks only at the planned sets.
- **Switching programme keeps the gym days you chose** (Jack). It used to reset them to the programme's suggested days. Now it keeps yours and, if the new programme needs more sessions, fills from its suggested days, then the first free day (`keepGym`). Same rule in setup.
- **Revised: switching programme doesn't fill missing gym days** (Jack). It keeps the days you chose (the first n if the new programme has fewer sessions) and leaves any extra day for you to pick; saving without it shows "Pick 3 gym days in Planned days (2 picked)", and setup's day step does the same. Only with no days chosen at all does it start from the programme's suggested days.
- **Workout labels trimmed** (Jack agreed): "+1 set" dropped, since the extra row and its Remove set already show it. "added today" became "· added": it still explains why the exercise has Remove instead of Swap and won't reappear next time, but "today" was wrong on a saved workout reopened later, and "· added" matches "· swapped for…" and the history.

## 1 Nov 2026 (photo recovery code)

- **Settings → "Photo recovery code" explains before anything changes** (Jack). It was "New photo recovery code" and went straight to a new code, which wasn't clear about what a recovery code is or when the old one stops working. Now the first card says what it's for and when to make a new one, with Make a new code / Cancel; someone with no code yet is told they'll get one with their first photo. The old code is replaced only when they tap "I've saved it" on the new-code card (that was already so; the wording now says it), so walking away at any step changes nothing.

## 1 Nov 2026 (320px tidy-ups)

- **At 320px (Display Zoom) long text wraps instead of ending in "…"**: the programme name in Settings takes two lines, and "Signed in as" sits above the email (which can break anywhere, so a long address never runs under the arrow). Workout set rows narrow their input columns at 320px only, keeping the 44px tick button, so "Set 3" stays on one line and rep ranges like "10–15" show whole. 375px and up are unchanged.
- **Backup nudge and "Other activity" left for now** (Jack): the focus moves to making the app easy for new people.
