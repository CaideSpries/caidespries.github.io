---
phase: quick
plan: 260408-qkv
subsystem: header/navigation
tags: [mobile, navigation, accessibility, ui]
dependency_graph:
  requires: []
  provides: [mobile-nav]
  affects: [Header.astro]
tech_stack:
  added: []
  patterns: [max-height CSS transition for show/hide, aria-expanded accessibility pattern]
key_files:
  modified:
    - src/components/common/Header.astro
decisions:
  - Used max-height transition instead of display toggle to enable smooth slide-down animation
  - Background set explicitly via JS (not CSS inheritance) so it is never transparent at scroll=0
metrics:
  duration: "~10 minutes"
  completed: 2026-04-08
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Quick Task 260408-qkv: Fix C1 — Add Mobile Navigation Hamburger Menu Summary

**One-liner:** Mobile hamburger nav with max-height slide-down transition, solid theme-aware background, aria-expanded, and outside-click dismiss.

## What Was Done

Task 1 (the only task) updated `src/components/common/Header.astro`:

1. Added `aria-expanded="false"` to `#mobile-menu-btn`.
2. Replaced `#mobile-menu` panel classes: removed `hidden` and `backdrop-blur-sm`, added `overflow-hidden` and `transition-[max-height] duration-300 ease-in-out`; set `max-height: 0` as inline style for closed state.
3. Replaced the minimal `menuBtn` script block with full open/close logic: `openMenu()` sets `max-height: 500px` and applies a solid opaque background (`rgba(8,8,8,0.97)` dark / `rgba(242,232,220,0.97)` light); `closeMenu()` resets to `max-height: 0`. Both functions update `aria-expanded` and `aria-hidden` accordingly.
4. Added outside-click handler on `document` to close the menu when tapping outside.
5. Added theme-toggle listener to re-apply the correct background colour when the menu is open during a theme switch.

The existing scroll handler (`updateHeader`) and desktop nav are untouched.

## Verification

`astro check` returned 0 errors in `Header.astro`. The 4 pre-existing errors in `wrapped/all-time.astro` and `worker/src/index.ts` are unrelated to this change.

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 0967f6b | feat(260408-qkv): add mobile hamburger nav with slide-down menu |

## Self-Check: PASSED

- `src/components/common/Header.astro` modified and committed at 0967f6b
- `aria-expanded="false"` present on button (line 51)
- `max-height: 0` transition present on panel (line 74)
- `openMenu` / `closeMenu` / outside-click handler present in script block
