# Comic Toolbox Gym — Design Principles (draft)

Status: STABLE — audited against the codebase and platform constraints on
2026-10-11. Distilled into CLAUDE.md.

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
  not merely "answered enough quiz questions right." Today, `G.mastery()`
  normalizes `avail` to whatever content *exists* for a tool
  (`js/core.js:189-202`) — a tool whose content is missing an exercise or
  fix-it can reach 100% pct using only lesson+quiz+cards, which is exactly
  the loophole this principle closes: **cap the displayed level at "Sharp"
  (not "Mastered") for any tool whose *content* has zero exercises or zero
  fix-it entries** (`CTG.EXERCISES`/`CTG.FIX` filtered by tool, independent
  of whether the user has done them). This is a content-completeness gate,
  not a user-effort gate — the existing pct math already handles user
  effort correctly.
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
- **Color semantics:** audited the actual usage — `--accent` (yellow)
  currently marks *both* decorative content ("Ask yourself" card border,
  the prompt box, the saved-writing border in the journal) *and* two
  primary action buttons (`js/runners.js:169` "Finish and review",
  `js/runners.js:292` "Compare with a model and self-check"). Achievement
  stars are already a separate hardcoded gold (`css/style.css:245`,
  `#e0a100`) and are *not* part of this conflict — correcting the earlier
  review on that point. The real fix: `--accent` should mean "this is the
  content you're producing or being prompted with" (box borders,
  promptbox) only; the two CTA buttons that currently borrow it should
  move to `.btn.primary` or a new deliberate "commit" style, so a button's
  color is never confused with a content marker.
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

**Feasibility audit, corrected from the original recommendation:** without
a push server (ruled out in §7), there is no reliable way to deliver a
notification while the app is fully closed. Periodic Background Sync
needs no server, but it is Chromium-only (Android/desktop Chrome, with an
engagement-score requirement), gives no guaranteed time-of-day, and has
**no support on iOS Safari at all** — which matters here because the
README's own install instructions are written for iOS Safari first. Don't
let the feature's name ("daily reminder") promise more than the platform
can deliver. Scope it in two honest tiers:

- **Tier 1 (all platforms, in scope now): in-app catch-up nudge.** On
  boot, if the user missed yesterday (no qualifying activity — see
  streak-integrity rule below) or hasn't practiced today by a settings-
  configured local time, show a prominent, named-what's-due banner
  (e.g. "3 cards and a 5-minute sprint are waiting") rather than a
  generic "come back." This only fires while the app is opened, but it's
  guaranteed to work everywhere and needs no permission prompt.
- **Tier 2 (best-effort, Chromium/Android/desktop only): background
  notification** via `Notification` + `Periodic Background Sync`,
  gated behind an explicit opt-in toggle in Settings (never
  auto-requested on first load). Document in-app that this tier may not
  fire reliably or at all on iOS/Safari, rather than silently failing.
- Settings must let the user pick a time and turn either tier off
  entirely.
- Streak integrity threshold: see §2 — a streak day requires a production
  item or a completed session, not a single trivial action.

## 6. Accessibility & technical constraints (keep doing this)

- No build step, no network dependency, offline-first — preserve.
- Keyboard shortcuts, ARIA live regions, skip link, focus-visible,
  reduced-motion support — preserve, extend to new features.

## 7. Explicit non-goals

- No backend, no accounts, no cross-device sync, no push server. The
  in-app catch-up nudge and best-effort background notification (§5) are
  the one exception that touches "new capability beyond pure static
  files," and both stay fully client-side.
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
