---
phase: quick
plan: 260409-hnr
subsystem: wrapped
tags: [wrapped, cleanup, simplification]
depends_on: []
provides: [clean-wrapped-pages]
affects: [src/pages/wrapped, src/components/wrapped/TemporalSection.astro]
tech_stack:
  patterns: [section-unmounting, component-simplification]
key_files:
  modified:
    - src/pages/wrapped/[year].astro
    - src/pages/wrapped/all-time.astro
    - src/components/wrapped/TemporalSection.astro
decisions:
  - TopAlbumsSection placed before TemporalSection on year pages (content before pattern)
  - Component files preserved — only imports/mounts removed
metrics:
  duration: ~5min
  completed: 2026-04-09
  tasks_completed: 2
  files_modified: 3
---

# Quick Task 260409-hnr: Remove Overly Analytical Wrapped Sections Summary

**One-liner:** Stripped five analytical sections from year pages and two from all-time, simplified TemporalSection to monthly bar chart only with neutral "Listening / Pattern" heading.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Strip analytical sections from year and all-time pages | b2d61b4 | `[year].astro`, `all-time.astro` |
| 2 | Simplify TemporalSection to monthly chart only with neutral heading | e0c52ff | `TemporalSection.astro` |

## What Changed

### `src/pages/wrapped/[year].astro`
- Removed imports: BehaviorSection, DiscoverySection, ExtremesSection, StreaksSection, LoyaltySection
- Removed their JSX mounts
- Reordered: TopAlbumsSection now before TemporalSection
- Remaining sections: Hero, StatsGrid, TopArtists, TopTracks, TopAlbums, TemporalSection, Closing

### `src/pages/wrapped/all-time.astro`
- Removed imports: AllTimeLoyaltySection, TasteTurnoverSection
- Removed their JSX mounts
- Remaining sections: nav, AllTimeHero, YearByYear, TopArtists, TopTracks, TopAlbums, AllTimeClosing

### `src/components/wrapped/TemporalSection.astro`
- Removed HeatmapChart import
- Simplified Props interface to `monthly` only
- Removed maxWeekly, maxHourly consts
- Heading changed from "When You / Listened" to "Listening / Pattern"
- Removed weekly day-of-week chart block
- Removed hourly chart block
- Removed heatmap block
- Removed mb-6 from monthly card

## Deviations from Plan

None — plan executed exactly as written.

## Build Verification

Vite bundle completed successfully (651ms). A pre-existing build error in `src/pages/projects/[slug].astro` (missing content file `topsis-network-selection.md`) is out of scope and unrelated to this plan's changes.

## Self-Check: PASSED

- `b2d61b4` confirmed in git log
- `e0c52ff` confirmed in git log
- All three modified files verified via grep checks
