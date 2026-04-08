---
phase: quick
plan: 260408-rcf
subsystem: accessibility
tags: [focus-trap, lightbox, keyboard-nav, wcag, a11y]
dependency_graph:
  requires: []
  provides: [lightbox-focus-trap]
  affects: [src/pages/projects/[slug].astro]
tech_stack:
  added: []
  patterns: [focus-trap, aria-modal]
key_files:
  modified:
    - src/pages/projects/[slug].astro
decisions:
  - Attach trapFocus listener per show() call and remove in hide() to avoid stale references and keep the global keydown handler untouched
metrics:
  duration: "~5 minutes"
  completed: "2026-04-08"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
requirements:
  - H5
---

# Phase quick Plan 260408-rcf: Fix H5 Lightbox Modal Focus Trap and Focus Restoration Summary

Inline focus trap added to the project lightbox: Tab cycles within three buttons (close/prev/next), focus moves to close button on open, and returns to the originating thumbnail on close.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add focus trap to lightbox show/hide and keydown handler | 948073c | src/pages/projects/[slug].astro |

## What Was Built

Added three pieces to the existing inline `<script>` block in `[slug].astro`:

1. `lastFocused` variable — captures `document.activeElement` at open time for restoration on close.
2. `FOCUSABLE` selector constant and `trapFocus(e)` function — intercepts Tab/Shift+Tab and wraps focus within the lightbox's focusable buttons.
3. `show()` additions — saves `lastFocused`, focuses `#lightbox-close`, attaches `trapFocus` to the lightbox element.
4. `hide()` additions — removes `trapFocus` listener, calls `lastFocused?.focus()`, nulls `lastFocused`.

The existing global `keydown` listener (Escape/ArrowLeft/ArrowRight) is untouched — it already guards with `classList.contains('hidden')`.

## Verification

`astro check` — 0 errors in `[slug].astro`. The 4 pre-existing errors in `wrapped/all-time.astro` and `worker/src/index.ts` are unrelated to this change.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- src/pages/projects/[slug].astro — modified and committed
- Commit 948073c — verified present in git log
- `lastFocused`, `trapFocus`, `FOCUSABLE` present in file
- `closeBtn.focus()` pattern present in show()
- `lastFocused?.focus()` pattern present in hide()
