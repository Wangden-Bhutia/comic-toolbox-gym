# CLAUDE.md

Guidance for Claude Code when working in this repo. Full rationale and
open-question history live in `PRINCIPLES.md` — read it when a change
isn't covered by a rule below. Update `PRINCIPLES.md` first, this file
second, when a rule changes.

## What this app is for

A daily practice habit for *The Comic Toolbox* that should make the
user's writing measurably funnier over weeks — not just make them good
at quizzes about the book. When judging whether a change is good:
1. Does it help the user keep showing up? (habit)
2. Does it help their writing quality trend up? (the actual point)

Quiz/flashcard engagement that doesn't serve either is not a win by
itself.

## Rules to apply when touching this code

**Mastery (`js/core.js` `G.mastery`)**
- Weights are lesson 5 / quiz 20 / cards 20 / ex 40 / fix 15 (production
  55%, recall 40%, lesson 5% gate). Don't shift weight back toward
  quiz/cards without updating `PRINCIPLES.md` §2 first.
- A tool whose content (`CTG.EXERCISES`/`CTG.FIX` filtered by tool id)
  has zero exercises or zero fix-it entries displays capped at "Sharp,"
  never "Mastered," however high raw pct runs (`G.mastery()` already
  enforces this — don't bypass it for a new content type without adding
  the same gate).
- A streak day requires a production item (exercise/fix-it save, lab
  project) or a *completed* quiz/card/workout session — never a single
  answered question or rated card on its own (`G.addActivity`'s
  `qualifies` flag, `G.streak()`/`G.bestStreak()` reading `a.prod`).
  When adding a new practice mode, give its completion point — not its
  per-item events — `qualifies:true`.
- The exercise score is a recency-weighted average over the last 10
  exercises per tool (geometric decay), not a flat average of the last 3
  — don't collapse that back to a short flat window, it was specifically
  changed so continued practice keeps moving the score instead of
  freezing at 3 reps.
- `G.weakestStale()` (not `G.weakest()`) is what picks the writing/fix-it
  focus for the workout and the Write page's "Surprise me" — it biases
  toward tools that haven't been *produced on* in a while (via
  `G.lastPracticed()`), standing in for the spaced re-practice that
  writing/fix-it don't otherwise get. `G.weakest()` itself (pure mastery
  pct, no staleness) is still correct for display-only contexts like the
  dashboard's "Needs attention" list — don't swap those.

**Content (`js/content/*.js`)**
- Every tool needs, eventually: 1 lesson, ≥3 quiz, ≥3 cards, ≥1 exercise,
  ≥1 fix-it. All 65 currently do — when adding a new tool, add all five
  before merging, or it silently caps at "Sharp" (see above) and its
  Fix-it tab shows an empty state instead of content. Check coverage
  with `grep -oE '^X\("[a-z_0-9]+"' js/content/fix-*.js | sed 's/^X("//' | sort -u`
  (and the equivalent for `E(`/`Q(`/`C(`) against the tool list.
- A lesson should contain at least one line that demonstrates the
  technique, not just describes it.
- Don't add a new exercise to a prompt bank already shared by 4+ unrelated
  tools; split the bank or add a variant instead.
- New quiz questions should lean toward application ("spot the weak
  one," "fix it") over pure definition recall.
- "Mark as read" (the tool page's Learn tab) runs one random quiz
  question from that tool before setting `G.S.read[id]` — a retrieval
  attempt, not a self-report click. Keep it to exactly one question; it's
  a speed bump, not a new gate. Any new "mark as understood" affordance
  elsewhere should follow the same pattern rather than a bare checkbox.
- The writing runner's prompt can be swapped for free text via "Use my
  own idea" (`renderPrompt()`/`ownIdea` in `js/runners.js`), bound
  straight to `pr.text` so it saves to the journal like any generated
  prompt. Keep new prompt-related UI compatible with that path rather
  than assuming `pr.text` is always bank-generated.

**UX/UI**
- Dashboard above the fold = greeting + one hero CTA + streak chip only
  (the streak chip lives in the topbar, not the dashboard body — don't
  add a second one there). Stats row, week strip, weakest-tools card
  live below a `.sec` break; there's no quick-launch tile grid on the
  dashboard — that's the Practice hub's job (`#/practice`), linked once.
  Don't add new surfaces above the fold that compete with the hero CTA,
  including a reminder nudge — see Reminders below for how that one
  avoids it.
- `--accent` means "this is content you're producing or being prompted
  with" (promptbox, the "Ask yourself" card border, saved-writing
  border) — never an action button's color. If a new button is tempted
  to reach for `.btn.accent`, it shouldn't exist; use `.btn.primary` or
  a new, deliberately-named style instead.
- Badges are one component: `.badge` base + `.badge-positive` /
  `.badge-brand` / `.badge-streak` / `.badge-lv0`–`.badge-lv5` /
  `.badge-sm` / `.badge-label` modifiers (`css/style.css`, "Badges"
  section). Don't reintroduce a one-off pill/tag style — add a modifier
  to this family, and only add a new one if it's a genuinely distinct
  semantic state, not a visual tweak.
- Any string the app itself writes to the user (toast, empty state,
  achievement name, button label) should read like someone who's read
  the book wrote it, not generic SaaS copy. Don't write "X marked as
  done. +N XP" — tie the copy to what just happened in the book's terms.
  Plain CRUD confirmations (Saved./Deleted./Copied.) are a deliberate
  exception — predictability matters more than personality there.

**Reminders / habit (`G.reminderState()` in `js/core.js`, wired in
`js/app.js` and the dashboard hero in `js/views.js`)**
- No push server, no backend — stays client-side.
- Tier 1 (in-app catch-up nudge) is live: it folds into the dashboard
  hero's existing single CTA rather than a second banner (see the UX
  rule above), plus a one-off boot-time toast when the session resumes
  on a non-dashboard route, so it still surfaces without a second
  competing surface. `js/app.js`'s `render()` is the single place that
  tracks what reminder state is currently shown (`lastRemState`) — don't
  read or set that anywhere else, or a navigation path that bypasses
  `render()` will silently go stale (this happened once; the fix was
  moving the tracking into `render()` itself).
- Tier 2 (background/closed-app notification) is live, best-effort,
  Chromium-only, opt-in via Settings, never auto-requested on load, and
  the toggle only appears when `G.bgReminderSupported()` resolves true —
  otherwise Settings shows the iOS/Safari caveat instead of silently
  doing nothing. The service worker (`sw.js`'s `periodicsync` handler)
  can't read localStorage, so it reads a single IndexedDB flag
  (`G.markQualifyingToday()`, written on every qualifying activity) to
  decide whether to stay quiet on a day already covered — don't swap
  that for a check that assumes the SW can see `G.S` directly, it can't.

## Non-goals (don't scope these in without a deliberate decision)

- Backend, accounts, cross-device sync, push server.
- Social features (sharing streaks, leaderboards, public journals).
- AI/external judging of writing quality — self-review stays the
  mechanism for now. (If self-assessment proves insufficient, an opt-in
  AI-feedback pass on journal entries is the likely next step, but it's
  not current scope.)

## Keep doing this

- No build step, no network dependency, works from `file://` and fully
  offline once loaded.
- Keyboard shortcuts, ARIA live regions, skip link, `:focus-visible`,
  reduced-motion support — extend these to any new feature, don't
  regress them.
- After changing any file, run `node tools/build-sw.js` so the service
  worker cache list updates. Run `node tools/validate.js` after content
  changes.
