---
phase: 260408-rcb
plan: "01"
subsystem: header / navigation
tags: [css, mobile-nav, dark-mode, bug-fix]
dependency_graph:
  requires: []
  provides: [solid-mobile-menu-background]
  affects: [src/components/common/Header.astro, src/styles/global.css]
tech_stack:
  added: []
  patterns: [CSS-over-JS for paint-time styling, light/dark ID rules in @layer components]
key_files:
  created: []
  modified:
    - src/styles/global.css
    - src/components/common/Header.astro
decisions:
  - Use CSS ID rules (#mobile-menu / .dark #mobile-menu) in @layer components rather than Tailwind dark: class or inline style, to avoid inline-style specificity conflicts and guarantee paint-time rendering
metrics:
  completed: "2026-04-08"
---

# Phase 260408-rcb Plan 01: Mobile Nav Menu Solid Background Summary

Fixed mobile nav hero bleed by giving `#mobile-menu` a paint-time CSS background, eliminating the JS-timing window where the panel was transparent.

## What Was Done

Root cause: `#mobile-menu` had no background in CSS. JS `openMenu()` set background at click-time with `rgba(..., 0.97)`, creating a flash/bleed window at scroll=0 where the transparent header showed through the panel.

Fix: added two CSS rules in `global.css` under `@layer components`:

```css
#mobile-menu {
  background-color: #f2e8dc;
  box-shadow: 0 4px 12px rgba(26, 26, 26, 0.12);
}
.dark #mobile-menu {
  background-color: #080808;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
```

Also hardened `getMobileMenuBg()` in `Header.astro` to return `alpha: 1` (was `0.97`) so JS belt-and-suspenders also applies a fully opaque color.

No changes to markup, animation, max-height transition, or open/close logic.

## Tasks

| # | Name | Commit | Status |
|---|------|--------|--------|
| 1 | Apply solid CSS background to #mobile-menu and harden JS colors | 8864376 | Done |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — purely visual CSS fix, no new trust boundaries or data surfaces.

## Self-Check: PASSED

- `src/styles/global.css` modified: confirmed
- `src/components/common/Header.astro` modified: confirmed
- Commit 8864376: confirmed
- Build: passed (18 pages, no errors)
