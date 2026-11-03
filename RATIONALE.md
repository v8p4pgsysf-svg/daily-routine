# Weekly Routine — Rationale Log

**What this file is:** why the app is the way it is — rejected alternatives, reversals and workflow decisions. Append-only: never edit or remove entries; add a new one to reverse an old one.

**What it is NOT:** current state. That lives in the code and `CLAUDE.md`.

**Older entries** (31 Oct to 1 Nov 2026) are in `rationale/2026-10-31-to-11-01.md`, moved word for word. Topics there: backfilled from the original build chat; Home Screen nudge; Settings: one Workouts box; layout review; feedback; email and forgotten passwords; review photos; photo encryption; end-of-evening sweep; test clock; Today vs the grid; starter week and late reviews; early days: empty charts; review of the morning's work; weekly review off; settings from newer versions; habits only; changing today's workout; gym days; photo recovery code; 320px tidy-ups; new-user clarity, first batch; one word for weight training; meal prep wording; review folds away; starter week header; final new-user review.

**How to use it:** search for the topic (`grep -n -i "<topic>" RATIONALE.md rationale/*.md`) before reversing a decision; don't read the files end to end.

---

## 2 Nov 2026 (what the app is)

- **The app is one weekly routine, not a weights tracker with extras** (Jack and Claude). Jack felt the purpose was unclear and that workout tracking was its strongest part. Claude's view: last session's numbers and easy add/remove are standard in lifting apps (Strong, Hevy), so as a pure lift tracker it would compete on their ground. What's distinctive is the combination: training, habits and a review adding up to one weekly score, plus automatic weight increases and a programme tied to planned days.
- **Story: "Plan your week. Train and tick off habits. Review how it went."** (Jack chose; three beats, no "Sunday" since the review day varies and can be off). Shown on sign-in and the setup Welcome step.
- **Name: Weekly Routine** (over Daily Routine and Weekly Tracker): the week is what ties everything together, "routine" covers training and habits and is already the app's word, and it was the original name. The repo and URL stay `daily-routine` (renaming would break installs).
- **No three-way "training / habits / both" choice at sign-up** (Jack agreed). It would invite people to choose a smaller app before seeing what the combination offers. The app already adapts quietly (0 weights = habits only). Revisit if the watch session shows a habits-only person struggling through the training steps.
- **Own domain is the next step after the rename, and should come before inviting people**: a new domain is a new origin, so existing installs would need reinstalling and signing in again.

## 2 Nov 2026 (name, story and Welcome page shipped)

- **Renamed to Weekly Routine** in the title, sign-in heading, Home Screen card and manifest `name`; the Home Screen label (`short_name`, Apple title) stays "Routine", and the repo and URL stay `daily-routine`.
- **Sign-in shows the story under the name** ("Plan your week. Train and tick off habits. Review how it went.") in place of "Sign in to continue.", which the button already says. Jack liked it. The Add to Home Screen card was left without it: Jack had cut pitch lines there before, and people see sign-in right after installing.
- **Setup's Welcome is a page of its own** (Jack). A tagline line above the weight question was tried first and read as clutter; Jack wanted the story alone, then weight at the top of the next page. Iterations, all Jack's calls: the three points became closed drop-downs that explain each part of the app (Claude drafted the wording; Jack changed "protein" to "protein intake"); a full-width Get started button replaced the small top-right Next (Claude's suggestion: on an otherwise empty page the corner Next was easy to miss); no dots on the Welcome page; a Next button opens each point in turn and becomes Get started once all three have been opened, so everyone sees what the app does (accepted cost: three taps before setup); the button is pinned low so it doesn't move as points open.
- **"The Today tab"**, not "home tab", in the Plan your week point: Today is the tab's label, so a new person looking for "home" wouldn't find it.
- **The settings-cog line moved to the Welcome page**, under Get started, so the weight question leads the next page (Jack asked; Claude agreed).
- **Progress check-ins tooltip says "x/y check-ins"**, matching the review summary; it still said "targets".
- **Hosted test fix:** run.py signed back in while the page was still reloading after sign-out, and the reload could wipe what it typed (also seen on the unchanged app, about 1 run in 6). It now waits for the reload to settle.
- **Welcome points open one at a time** (Jack): tapping a point closes whichever is open, matching what Next does.

## 2 Nov 2026 (exercise menu; chest press names)

- **Exercise progress's "View an exercise" menu lists only lifts with logged sets** (Jack). It listed the whole programme with "· no data yet" on most of them, which read as clutter once some lifts had data; an empty lift has nothing to show anyway. "Building data: …" above it is unchanged (those lifts have data, just not enough for a status).
- **"Flat Dumbbell Bench Press" → "Flat Dumbbell Chest Press" and "Incline Dumbbell Press" → "Incline Dumbbell Chest Press"** (Jack: the first isn't what it's called, and the two should match). Short names "DB chest press" / "Incline DB chest press". Ids unchanged (`flat_db_bench`, `incline_db_press`), so programmes and history keep working and show the new names. At 320px the longer short name wraps to two lines in the key-lifts table, like other long names.

## 2 Nov 2026 (training tidy-ups)

- **Exercise progress says "Building data on N lifts"** (Jack: the list of names was clutter; Claude suggested keeping a count).
- **Last time's extra sets are shown, not carried forward** (Jack). If last time had more sets than today's rows, the workout screen says "Last time you also did Set 4: 40×8" above + Set; + Set adds the row with last time's numbers. Carrying extras forward automatically was rejected: a one-off extra would quietly become the plan. "Weight goes up" still looks only at planned sets.
- **Swap and added notes sit on their own line** ("Instead of Bench Press", "Added") under the name, in history and on the workout screen. Inline, a long note pushed that row's sets onto a second, left-aligned line. "Swapped for" was also ambiguous about which way round the swap went. Below 360px every history row puts its sets under the name (right-aligned), since four sets squeezed names into three lines.
- **Today's done lines drop "counted in this week's weights/cardio target"** (Jack): the rows below already show the count.
- **Planned next: a share card** (an image of the full workout, every set; Jack). A public link was ruled out: it would make a workout readable without signing in.

## 2 Nov 2026 (suggested programmes updated)

- **Both suggested programmes rewritten to Jack's spec**: every exercise 3 sets; main lifts 6–8, accessories 10–12. Full body gains Leg Extension (B) and Cable Chest Fly (C), new catalog entries; glute focus reorders A (pull-ups before pressing). The full-body preset now has its own list instead of mirroring Jack's original routine, so Jack's own programme reads "Custom" until he switches.
- **Existing users aren't moved onto the new versions automatically**: it would overwrite their edits and change rep ranges mid-progression. They can Switch in Settings (history stays). An "updated version available" note was judged not worth it until other people use the app.
- **Suggested days: Mon, Wed, Fri for both, and where setup starts** (Jack; Wed/Fri/Sun and Mon/Wed/Sat were tried and dropped the same afternoon). Mon/Wed/Fri also leaves the default cardio days (Tue, Sat) free.
- **Exercise renames (Jack): "Seated Leg Curl"; "Leg Press" (was "Hack Squat / Leg Press").** Kept: "45° Back Extension", "Overhead Triceps Extension" ("Triceps", matching Triceps Pushdown). Jack's glute list named some of these differently; the existing exercises were kept rather than adding near-duplicates, which would split a lift's history in two.
- **Short labels are maintained for every exercise** (Jack: if they exist for a reason, keep them complete and current). One pattern: same words in sentence case, dropping qualifiers (Barbell, Seated, Machine, Standing, 45°, Flat), Dumbbell → DB. "Cable fly" became "Cable chest fly" and "Reverse lunge" became "Reverse DB lunge" to fit it. A test (EC1) fails if an exercise has no short label.
- **One-sided lifts say "per leg"** (`perLeg` in the catalogue: Bulgarian split squat, reverse DB lunge): "3 × 10–12 per leg" on the workout screen and the programme list.
- **Set boxes have no number spinners**: desktop browsers reserved room for them and cut the "10–12" placeholder to "10–1"; phones never show them.

## 2 Nov 2026 (share card)

- **A finished workout can be shared as an image card** (Jack: every set, not just the best; Claude had leaned to best set only). Drawn on the device, so nothing is uploaded or made public; a shareable link was ruled out because it would make the workout readable without signing in.
- **Where Share lives:** the saved message after Finish (it stays until the next tap, since a fading button is hard to hit), each Training history entry, and the saved-workout screen. Tried on Today's "Workout done" card too and dropped: two buttons pushed its text onto extra lines even at 390px.
- **What's on it:** workout letter, date, duration, set count, then each exercise with logged sets. Exercises not done are left off. "New best" means a heavier top set than any earlier workout of that lift (assisted lifts excluded, since less assistance isn't heavier). Assisted sets say "assist" so friends don't read assistance as weight lifted; one-sided lifts say "Reps per leg". Left off: notes, bodyweight, weekly %, photos, habits.
- **Follows the person's light or dark look**, rather than one fixed design, so it matches what they see.
- **Weights workouts only for now**; Jack didn't say on cardio, so a cardio card waits until asked.
- **Footer says "Made with Weekly Routine" plus the tagline** (Jack: a bigger shout-out for people who like it). No printed address: the github.io one is too long to read or type; revisit with the own domain.
- **The app's link goes along with the picture** in the share sheet (Messages and WhatsApp keep it; Instagram drops it). If a target only accepts files, the picture goes alone.
- **No QR code** (Jack). Considered for Instagram, where the link is dropped, but it would point at the github.io address and lead strangers to an invite-only sign-in.
- **Open: what a stranger who follows the link can do** (request an invite, or a line saying to ask whoever shared it). Sign-up is still invite-only; decide with the domain.

## 2 Nov 2026 (history sets; card footer)

- **Training history shows every set as a tile under the exercise name** ("31.25 kg × 8"), the same words and look as the share card (`setLong`). Inline "42.5×8 · 42.5×8 · …" lists squeezed names into three or four lines once weights had decimals. Rejected: rounding in history (Jack's first idea; it would show weights not lifted, disagree with the workout screen's "Last …", and progression steps are 1–2.5 kg); writing each weight once then the reps ("42.5 × 8, 8, 8"), which Jack found less clear and inconsistent with the card.
- **An open history entry folds after Share and when leaving the Training tab** (Jack).
- **Card footer: "Log your workouts with Weekly Routine"** (Jack), also the text sent with the link.
- **Reversal the same evening: history sets are one line of small text, not tiles** (Jack: an open entry got far too long). Under each name: "31.25×8 · 31.25×8 · …" (exact weights; wraps only between sets). Skipped exercises share one "Not done: …" line at the end. The share card keeps its tiles, since it has the room.
- **"Instead of …" and "Added" are shown only on the workout screen** (Jack agreed Claude's view): there they explain today's change to the plan; in history and on the share card the exercise name says what was done.
- **History rows: the second line names the workout ("Workout A", plus "· notes"), like cardio's "Run · Easy"** (Jack). The old line listed the first three exercises with their heaviest weight and was always cut off. Rejected: short exercise names wrapping to two lines (Jack: no extra line), and no second line at all (rows of two heights next to cardio). Sets and time stay on the right.
- **History is already one-open-at-a-time**: opening an entry closes the open one (checked with two workouts). Jack saw two open once; the steps that led there are still to find.
- **Short labels: Barbell → BB and Dumbbell → DB, never dropped** ("BB squat"); "Triceps extension" for Overhead Triceps Extension (Jack). Used only in setup's programme summary and the key-lifts table.
- **History keeps full names, with sets on the line below** (Jack). Tried the same evening and dropped: sets on the name's line when they fit (a mix of one- and two-line rows looked odd), and swapping to short labels when they didn't (a mix of "BB squat" and "Seated Cable Row" in one entry was confusing). The experiment sits unused on the `history-fit` branch.

## 3 Nov 2026 (housekeeping)

- **Older rationale moved, not trimmed** (Jack: the file was getting big). The 31 Oct to 1 Nov entries went word for word into `rationale/2026-10-31-to-11-01.md`; this file keeps the recent ones plus a topic index. CLAUDE.md now says to search these files by topic rather than read them, since reading the whole log at session start was the real cost.
- **One test command, `tests/run-all.sh`** (rebuilds, runs every suite with a time limit, one line each). It replaces the separate commands each session strung together; no new checks. Jack asked whether it was more red tape: it isn't, it's the same tests in one step.
- **Email-code sign-in removed** (Jack: email and password it is). It was the original sign-in, switched off by a setting since 31 Oct. "Forgot password?" still emails a 6-digit code; that's separate and unchanged.
- **Dead code removed**: six functions nothing called (an old markdown week export among them) and about 5 KB of styles for screens that no longer exist. Checked by comparing screenshots of every screen before and after: identical. Kept on purpose: the code paths for the retired Claude-artifact version, which the app test suite still runs through.
- **The app's version is now a fingerprint of the files phones keep offline, not the build time.** A time stamp changed `docs/` on every test run, leaving changed files behind and risking pointless "updates" on phones. A fixed number was rejected: phones would then miss a change to `host.js` or `config.js`, which the version also covers.
