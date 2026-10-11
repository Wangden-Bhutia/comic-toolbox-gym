# Comic Toolbox Gym — Design Principles (draft)

Status: DRAFT — under active review. Once stable, distill into CLAUDE.md.

This document is the source of truth for *why* the app is shaped the way it
is. Code changes, content changes, and UI changes should be checkable
against these rules. If a change can't be justified by a rule here, either
the change is wrong or the rule is missing — fix the rule, don't skip it.

---

## 0. North Star

**A daily practice habit that measurably makes the user write funnier —
showing up consistently matters, but what the habit is *for* is writing
quality going up, not quiz accuracy.**

Primary user outcomes this app is judged against, in order:
1. Is the user still showing up most days? (habit held)
2. Is their self-rated writing quality trending up over weeks? (the point)

Recall tools (quiz, cards) exist to *support* outcome 2 — they are
scaffolding, not the destination. If a change improves quiz/card
engagement but doesn't serve writing quality or the habit, it's not a win.

---

## 1. Non-negotiable principles

Derived from the review. Each should be falsifiable — a change either obeys
it or doesn't.

1. **Writing beats recall.** Any feature/content decision that increases
   recall-testing (quiz, cards) at the expense of production (writing,
   fix-it) needs explicit justification.
2. **Don't out-judge the book.** The book's own content (ch. 2, "Ferocious
   Editor") warns against constant self-judgment. The app's gamification
   layer (XP, mastery %, streaks) must not contradict this — numeric
   judgment should stay in the background, not be the dominant feedback
   loop on every screen.
3. **The product should be a little funny.** Copy, empty states, toasts,
   achievement names — anywhere the app talks to the user — is a chance to
   model the thing it's teaching. Flat SaaS copy ("Lesson marked as read.
   +5 XP") is a defect, not neutral.
4. **One obvious action per screen.** Entry points (dashboard, tool page)
   should have a single dominant CTA. Stats/analytics support the action;
   they don't compete with it above the fold.
5. **Coverage parity is a content bug, not a content gap.** If a tool has
   quiz+cards but no fix-it, that's tracked and prioritized, not silently
   shipped as an empty state.
6. **Self-assessment is necessary but not sufficient.** Self-rating stays,
   but the app should be honest that it's not an external verdict — and
   should look for opportunities to add real signal (see open questions).

---

## 2. Mastery & progression rules

- **New mastery weights:** lesson 5 (gate) / quiz 20 / cards 20 / ex 40 /
  fix 15. Production (ex+fix) = 55%, recall (quiz+cards) = 40%, lesson = 5%
  gate. This replaces the old 8/24/24/28/16 split, which gave recall 48%
  and production only 44%.
- **"Mastered" (92%+) must mean**: the user has written and self-reviewed
  this tool's techniques repeatedly over time with rising self-scores —
  not merely "answered enough quiz questions right." A tool should not be
  able to reach Mastered on quiz+cards alone, however high `avail` lets it
  go when `ex`/`fix` don't exist yet for that tool — see §3 parity rule;
  until a tool has at least one exercise and one fix-it, cap its visible
  level at "Sharp," not "Mastered," regardless of raw pct.
- Streaks/XP stay, but are secondary chips (top bar, Progress page), never
  the dominant element of the dashboard hero (see §4).
- **Streak integrity:** a day only counts toward the streak if it includes
  at least one *production* item (an exercise or fix-it save) OR a full
  completed quiz/card session — not a single answered flashcard. Update
  `G.streak()`'s definition of a qualifying day accordingly.

## 3. Content authoring rules

- Every tool must eventually have: 1 lesson, ≥3 quiz, ≥3 cards, ≥1 exercise,
  **≥1 fix-it** (currently 16/65 tools have zero fix-it — backlog item).
- Lessons should contain at least one line that demonstrates the tool's
  comic technique, not just describes it.
- Prompt banks: a given bank should not be shared across more than 4
  unrelated tools, to avoid prompt staleness across "different" exercises.
  Where a bank is currently shared more widely, split it or add bank
  variants rather than reusing the same pool verbatim.
- Quiz questions should be weighted toward application ("spot the weak
  one", "fix it") over pure definition recall where possible.

## 4. UX/UI rules

- **Dashboard above the fold:** greeting + one hero CTA ("Start workout" /
  "Next lesson") + streak chip only. Stats row, week strip, "weakest
  tools," and the 8-tile quick-launch grid all move below the fold or
  onto the Progress/Practice hub pages. The install-card stays but
  collapses once dismissed or installed (already does).
- **Color semantics:** `--accent` (yellow) means *writing in progress /
  the thing you're actively producing* only — prompt box, active timer
  state. It must not also mean "achievement" or "reveal model answer."
  Give fix-it's reveal button and achievement stars their own treatment
  (e.g. brand-soft background, not accent).
- **Component budget:** consolidate `.chip`, `.tag`, `.cnt`, `.lv*` into
  a single badge component with 3 visual weights (neutral / positive /
  brand), rather than ~6 ad hoc styles.
- **Voice/copy:** every user-facing string the app itself writes (toasts,
  empty states, achievement names, button labels) should read like it was
  written by someone who has read the book, not a generic SaaS. E.g.
  "Lesson marked as read. +5 XP" → "Lesson read. The editor stays outside
  for now." Empty fix-it tab → not "No fix-it challenge for this tool
  yet," but something that owns the gap in voice, e.g. "This tool doesn't
  have a fix-it drill yet — write one of your own in the Write tab
  instead." Achievement names get real names, not "5-day streak."

## 5. Habit / accountability rules

(From the earlier review — the app currently has no reminder mechanism.)
- **In scope: local notifications via the service worker.** Add an
  opt-in daily reminder (`Notification` + `Notification.requestPermission`,
  scheduled via the SW, e.g. Periodic Background Sync where supported,
  with a plain `setTimeout`-based in-app nudge as the fallback for
  browsers/platforms without background delivery). This is a real,
  scoped feature to build — not deferred.
- Reminder copy should name what's due (e.g. "3 cards and a 5-minute
  sprint are waiting") rather than a generic "come back" push — ties the
  reminder to the production-first philosophy in §0/§1.
- Settings must let the user pick a time and turn it off entirely; default
  off until explicitly enabled (don't surprise-request permission on
  first load).
- Streak integrity threshold: see §2 — a streak day requires a production
  item or a completed session, not a single trivial action.

## 6. Accessibility & technical constraints (keep doing this)

- No build step, no network dependency, offline-first — preserve.
- Keyboard shortcuts, ARIA live regions, skip link, focus-visible,
  reduced-motion support — preserve, extend to new features.

## 7. Explicit non-goals

- No backend, no accounts, no cross-device sync. Local notifications
  (§5) are the one exception that touches "new capability beyond pure
  static files," and even that stays client-side (no push server).
- No social features (sharing streaks, leaderboards, public journals).
- No AI/external judging of writing quality in this phase — self-review
  stays the mechanism. (Flagged as an open question for later, not ruled
  out forever: if self-assessment proves insufficient, an opt-in
  AI-feedback pass on saved journal entries is the most likely next step,
  but it's out of scope for the current rebalancing work.)

## 8. Change process

- This file is the source of truth. CLAUDE.md is a distilled,
  instruction-oriented version of it for in-editor guidance.
- When a rule changes, update this file first, then CLAUDE.md.
