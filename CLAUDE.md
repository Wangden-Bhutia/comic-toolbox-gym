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
  has zero exercises or zero fix-it entries must not display as
  "Mastered" even if raw pct hits 92%+ — cap the shown level at "Sharp."
  This is a content-completeness gate, independent of user effort.
- Streak (`G.streak()`/`G.addActivity`) should only count a day if it
  includes a production item (exercise or fix-it save) or a *completed*
  quiz/card session — not a single answered question/card. Implementing
  this needs a way to distinguish "session completed" from "item
  answered" in the activity log; don't just lower the bar incidentally
  while touching this code.

**Content (`js/content/*.js`)**
- Every tool needs, eventually: 1 lesson, ≥3 quiz, ≥3 cards, ≥1 exercise,
  ≥1 fix-it. Currently 16/65 tools have zero fix-it — when adding fix-it
  content, prioritize those tools first (check with
  `grep -oE '^X\("[a-z_0-9]+"' js/content/fix-*.js | sed 's/^X("//' | sort -u`
  against the tool list to find gaps).
- A lesson should contain at least one line that demonstrates the
  technique, not just describes it.
- Don't add a new exercise to a prompt bank already shared by 4+ unrelated
  tools; split the bank or add a variant instead.
- New quiz questions should lean toward application ("spot the weak
  one," "fix it") over pure definition recall.

**UX/UI**
- Dashboard above the fold = greeting + one hero CTA + streak chip only.
  Stats row, week strip, weakest-tools card, and the quick-launch tile
  grid belong below the fold or on Progress/Practice — don't add more
  surfaces competing with the hero CTA.
- `--accent` means "this is content you're producing or being prompted
  with" (promptbox, the "Ask yourself" card border, saved-writing
  border). Don't use it for action buttons — `js/runners.js:169` and
  `:292` ("Finish and review," "Compare with a model") should move to
  `.btn.primary` or a dedicated style, not stay on `.btn.accent`, as this
  gets cleaned up.
- Prefer consolidating `.chip`/`.tag`/`.cnt`/`.lv*` toward one badge
  component (neutral/positive/brand) rather than adding another one-off
  variant.
- Any string the app itself writes to the user (toast, empty state,
  achievement name, button label) should read like someone who's read
  the book wrote it, not generic SaaS copy. Don't write "X marked as
  done. +N XP" — tie the copy to what just happened in the book's terms.

**Reminders / habit (new feature area)**
- No push server, no backend — stays client-side.
- Build the in-app catch-up nudge first (shows on boot if yesterday was
  missed or today's practice hasn't happened by a configured time,
  names what's due). This works on every platform and needs no
  permission prompt — ship this before anything background-based.
- A background/closed-app notification tier is best-effort only
  (Periodic Background Sync, Chromium/Android/desktop) and must be
  opt-in via Settings, never auto-requested on load, and must be labeled
  in-app as unsupported on iOS/Safari rather than silently failing there.

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
