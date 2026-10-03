# Comic Toolbox Gym

A practice gym for the techniques in **"The Comic Toolbox: How to Be Funny Even If You're Not"** by John Vorhaus. It turns the book into deliberate practice: recall drills, timed writing, rewrite challenges, guided builders and a journal.

**Open `index.html` by double-clicking it.** No build step, no network. Everything is saved in your browser's localStorage (use Settings > Full backup now and then).

## Mobile web app (PWA)
- Mobile-first layout: bottom tab bar (Home, Skills, Practice, Journal, More), 44px+ touch targets, safe-area insets, 16px inputs (no iOS zoom), `dvh` units, sticky timer while writing, tab bar hides when the keyboard is open, swipeable flashcards (swipe to flip, right = Good, left = Again).
- Installable and fully offline: `manifest.webmanifest`, icons in `icons/`, and `sw.js` which precaches every file under a versioned cache. All paths are relative, so it works from any sub-path.
- **Host it** by copying the folder to any static HTTPS host (GitHub Pages, Netlify, Cloudflare Pages, or `python3 -m http.server` for localhost). Open the URL on your phone, then Share > Add to Home Screen (iOS Safari) or the install prompt (Android Chrome). The app shows an install hint.
- Service workers need https or localhost; from `file://` the app still works but skips the service worker.
- After changing any file run `node tools/build-sw.js` so the cache version and asset list update.

## What's inside
- **Coverage:** the Introduction and chapters 1-16 (65 tools). Chapter 9 ("Practical Jokes") is a one-line joke chapter in the book, so it has nothing to practise.
- **Dashboard:** overall mastery, streak, XP and levels, cards and questions due, weakest tools, and a **10-minute daily workout** (lesson of the day, due cards, 5 quiz questions, 5-minute writing sprint, wrap-up).
- **Skill map:** every tool as a ring tile by chapter. Levels: Unseen, Seen, Practising, Capable, Sharp, Mastered.
- **Per tool:** Learn (summary, key rules, example, "ask yourself"), Quiz, Cards, Write, Fix-it, Journal.
- **Quiz drills:** 158 questions (identify the tool, spot the weak one, concept, fix it) with instant explanations. Keys 1-4 answer. Misses return sooner.
- **Flashcards:** 162 cards, SM-2 style spaced repetition (Again / Hard / Good / Easy, keys 1-4, Space to flip).
- **Timed writing:** 95 exercises (many are the book's own), 40 randomised prompt banks (830 prompts, no repeats until a bank is exhausted), countdown timer with beep, idea / word counts, optional **no-edit mode**, auto-saved drafts.
- **Self-review:** after every exercise, a tool-specific rubric plus three process checks (finished? silenced the editor? named a win?). The self-score is saved with the work.
- **Fix-it:** 51 flat lines to rewrite with a given tool, then compare with a model answer and self-check.
- **Labs:** Premise Lab, Character Builder, Throughline Builder (10 steps), Sitcom Story Shortcut, Sketch Builder (9 points). Projects are saved and can be reopened and refined.
- **Journal:** everything you wrote, searchable, filterable, starred, editable. Export JSON / Markdown, full backup, import (merges by id).
- **Comic vocabulary:** daily capture (target 5, the book's Wade Boggs habit).
- **Progress:** practice heatmap, mastery by chapter, accuracy, achievements.
- **Accessible:** dark / light / auto theme, keyboard shortcuts (`?` for help, `g` then `d/m/p/w/q/c/j/l`), skip link, ARIA live announcements, focus outlines, reduced-motion support, responsive layout (bottom tab bar on phones).

## Mastery
Per tool, 0-100%: lesson read (8), quiz strength (24), card strength (24), writing self-scores (28), fix-it (16), normalised to what exists for that tool. Reaching Mastered (92%+) means you have quizzed, reviewed, written and fixed repeatedly over time.

## Extending (all content is plain JS in `js/content/`)
- `lessons-*.js` tools: `CTG.T(id, chapter, name, tag, summary, rules[], example, ask, rubric[4])`
- `quiz-*.js`: `Q(tool, kind, question, [correct, wrong, wrong, wrong], why)` (correct first; the app shuffles)
- `cards-*.js`: `C(tool, front, back)`
- `prompts-*.js`: `P(bank, "a|b|c")`
- `ex-*.js`: `E(tool, title, mode, minutes, target, instructions, bank(s), template, options)`; `fix-*.js`: `X(...)`; `builders.js`: wizard steps
- Add the new file to `index.html`, then run `node tools/validate.js`.

## Tests
`tools/validate.js` checks content integrity. `tools/e2e_mobile.py` runs a 390x844 touch-emulated pass over a local server including offline reload. `tools/e2e_test.py` is a Playwright script (uses installed Chrome) that drives the main flows with no console errors.

## Notes
Lessons, rules, questions and cards are short paraphrases written for practice, not the book's text. Buy the book and read it; this app is the gym, the book is the coach. Built from an OCR of a scanned copy, so wording may differ slightly from print.
