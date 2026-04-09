---
phase: quick
plan: 260409-hnr
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/wrapped/[year].astro
  - src/pages/wrapped/all-time.astro
  - src/components/wrapped/TemporalSection.astro
autonomous: true
must_haves:
  truths:
    - "Year pages show only: Hero, StatsGrid, TopArtists, TopTracks, TopAlbums, TemporalSection (monthly only), Closing"
    - "All-time page no longer renders AllTimeLoyaltySection or TasteTurnoverSection"
    - "TemporalSection shows only the monthly bar chart with a neutral heading (no you/your)"
    - "No component files are deleted"
  artifacts:
    - path: "src/pages/wrapped/[year].astro"
      provides: "Year page with 5 sections removed"
    - path: "src/pages/wrapped/all-time.astro"
      provides: "All-time page with 2 sections removed"
    - path: "src/components/wrapped/TemporalSection.astro"
      provides: "Simplified to monthly chart only"
---

<objective>
Remove overly analytical wrapped sections to create a clean music showcase.

Purpose: The wrapped pages currently have too many data-heavy analytical sections (behavior, streaks, discovery, extremes, loyalty). Strip these down to a simple showcase: Hero, Top Artists, Top Tracks, Top Albums, monthly listening pattern, and Closing.

Output: Three modified files with sections unmounted (not deleted) and TemporalSection simplified.
</objective>

<context>
@src/pages/wrapped/[year].astro
@src/pages/wrapped/all-time.astro
@src/components/wrapped/TemporalSection.astro
</context>

<tasks>

<task type="auto">
  <name>Task 1: Strip analytical sections from year and all-time pages</name>
  <files>src/pages/wrapped/[year].astro, src/pages/wrapped/all-time.astro</files>
  <action>
In `src/pages/wrapped/[year].astro`:
- Remove import lines for: BehaviorSection, DiscoverySection, ExtremesSection, StreaksSection, LoyaltySection (lines 9-12, 14)
- Remove their JSX mounts (lines 109-123 approximately): the `{data.behavior && ...}`, `{data.discovery && ...}`, `{(data.extremes || ...) && ...}`, `{data.streaks && ...}`, `{data.loyalty && ...}` blocks
- Keep: HeroSection, StatsGrid, TopArtistsSection, TopTracksSection, TemporalSection, TopAlbumsSection, ClosingSection (and their imports)
- Reorder remaining sections so TopAlbumsSection comes before TemporalSection (albums is content, temporal is pattern — content first)

In `src/pages/wrapped/all-time.astro`:
- Remove import lines for: AllTimeLoyaltySection (line 8), TasteTurnoverSection (line 9)
- Remove their JSX mounts: `<AllTimeLoyaltySection .../>` (line 82) and `<TasteTurnoverSection .../>` (line 84)
- Keep all other sections intact
  </action>
  <verify>
    <automated>cd /Users/spries/Documents/Curriculum Vitae/website/caidespries.github.io && grep -c "BehaviorSection\|DiscoverySection\|ExtremesSection\|StreaksSection\|LoyaltySection" src/pages/wrapped/\[year\].astro | grep "^0$" && grep -c "AllTimeLoyaltySection\|TasteTurnoverSection" src/pages/wrapped/all-time.astro | grep "^0$" && echo "PASS"</automated>
  </verify>
  <done>Year pages mount only Hero, StatsGrid, TopArtists, TopTracks, TopAlbums, TemporalSection, Closing. All-time page no longer mounts AllTimeLoyaltySection or TasteTurnoverSection.</done>
</task>

<task type="auto">
  <name>Task 2: Simplify TemporalSection to monthly chart only with neutral heading</name>
  <files>src/components/wrapped/TemporalSection.astro</files>
  <action>
In `src/components/wrapped/TemporalSection.astro`:

1. Remove the HeatmapChart import (line 2: `import HeatmapChart from "./HeatmapChart.tsx";`)

2. Simplify the Props interface — temporal only needs `monthly`:
```typescript
interface Props {
  temporal: {
    monthly: { label?: string; minutes: number; streams: number }[];
  };
}
```

3. Remove `maxWeekly` and `maxHourly` const declarations (lines 23-24)

4. Change the heading from "When You / Listened" to a neutral framing. Replace:
   - `<p ...>When You</p>` with `<p ...>Listening</p>`
   - `<h2 ...><span class="neon-text">Listened</span></h2>` with `<h2 ...><span class="neon-text">Pattern</span></h2>`

5. Remove the entire `<div class="grid md:grid-cols-2 gap-6 mb-6">` block (lines 64-109) containing the weekly day-of-week chart and hourly chart

6. Remove the entire heatmap `<div class="retro-card p-6 md:p-8">` block (lines 112-118) containing the HeatmapChart

7. Remove `mb-6` from the monthly chart's retro-card div (line 38) since it is now the only card — no bottom margin needed
  </action>
  <verify>
    <automated>cd /Users/spries/Documents/Curriculum Vitae/website/caidespries.github.io && grep -c "HeatmapChart\|weekly\|hourly\|heatmap\|When You\|Your" src/components/wrapped/TemporalSection.astro | grep "^0$" && grep -c "Pattern" src/components/wrapped/TemporalSection.astro | grep -v "^0$" && echo "PASS"</automated>
  </verify>
  <done>TemporalSection renders only the monthly bar chart. Heading reads "Listening / Pattern" with no you/your framing. Weekly, hourly, and heatmap charts are gone. HeatmapChart import removed.</done>
</task>

</tasks>

<verification>
- `npm run build` completes without errors (no broken imports or missing references)
- Year wrapped pages render: Hero, StatsGrid, TopArtists, TopTracks, TopAlbums, TemporalSection (monthly only), Closing
- All-time page renders without AllTimeLoyaltySection or TasteTurnoverSection
- No component files deleted from src/components/wrapped/
</verification>

<success_criteria>
Clean music showcase on year pages with no analytical clutter. TemporalSection shows monthly pattern only with neutral heading. All-time page streamlined. Component files preserved for potential future use.
</success_criteria>

<output>
After completion, create `.planning/quick/260409-hnr-remove-overly-analytical-wrapped-section/260409-hnr-SUMMARY.md`
</output>
