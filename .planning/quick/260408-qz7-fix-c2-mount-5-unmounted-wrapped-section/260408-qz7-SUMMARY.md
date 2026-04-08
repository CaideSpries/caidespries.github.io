---
phase: quick-260408-qz7
plan: "01"
subsystem: wrapped-pages
tags: [wrapped, astro, sections, rendering]
dependency_graph:
  requires: []
  provides: [temporal-section, behavior-section, discovery-section, extremes-section, streaks-section]
  affects: [src/pages/wrapped/[year].astro, src/components/wrapped/ExtremesSection.astro]
tech_stack:
  added: []
  patterns: [conditional-mount, section-wrapper]
key_files:
  created: []
  modified:
    - src/pages/wrapped/[year].astro
    - src/components/wrapped/ExtremesSection.astro
decisions:
  - ExtremesSection receives both extremes and stats props to preserve internal fallback logic
metrics:
  duration: "~5 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 2
---

# Phase quick-260408-qz7 Plan 01: Mount 5 Unmounted Wrapped Sections Summary

**One-liner:** Mounted TemporalSection, BehaviorSection, DiscoverySection, ExtremesSection, and StreaksSection into [year].astro with conditional data guards, and added missing py-24 px-4 section wrapper to ExtremesSection.

## What Was Done

Five fully-implemented wrapped section components existed but were never imported or rendered in the year page. This caused all year pages to silently omit temporal, behavior, discovery, extremes, and streaks data regardless of what the JSON contained.

**Task 1 — ExtremesSection.astro:** The template started with a bare `<div class="max-w-5xl mx-auto">` lacking the outer `<section class="py-24 px-4">` present on all sibling sections. The wrapper was added, indenting all inner markup one level, with no changes to frontmatter guard logic or inner content.

**Task 2 — [year].astro:** Added 5 import statements and 5 conditional mount expressions after `<TopTracksSection>` and before `{data.topAlbums ...}`. Each mount is gated on the relevant data field so year pages whose JSON lacks a field render nothing for that section (self-guard behaviour preserved). ExtremesSection receives both `extremes` and `stats` to support its internal fallback from `extremes.longestListen` to `stats.longestTrack`.

## Verification

- `astro check`: 4 pre-existing errors in `all-time.astro` and `worker/src/index.ts` — none in modified files.
- `astro build`: completed successfully, all 9 year pages built without errors.
- Section reference count in [year].astro: 10 (5 imports + 5 usages).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 7a36ee2 | fix(quick-260408-qz7): add outer section wrapper to ExtremesSection |
| 2 | 1a2b76b | feat(quick-260408-qz7): mount 5 unmounted sections in [year].astro |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- `src/components/wrapped/ExtremesSection.astro` — modified, verified section wrapper present at line 21
- `src/pages/wrapped/[year].astro` — modified, verified 10 references to new sections
- Commit 7a36ee2 — exists
- Commit 1a2b76b — exists
