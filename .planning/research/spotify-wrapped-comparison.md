# Spotify Wrapped — Design Comparison Research

**Researched:** 2026-04-07
**Domain:** Visual design, UX patterns, data presentation, animation
**Confidence:** MEDIUM — official Spotify Wrapped slides are not publicly documented in detail; findings draw from Spotify's own design/engineering blog posts, design press coverage, and their newsroom. Specific color hex values and pixel-level layout specs are inferred from high-quality secondary sources.

---

## Official Spotify Wrapped — Design Inventory

### Format and Navigation Model

Spotify Wrapped is a **vertical story/slide format** — one stat or narrative beat per screen, navigated by tapping or swiping forward. It lives inside the Spotify mobile app (not a web page) and is accessed from a banner on the Home tab. Each slide is designed to be screenshot-and-share in a single action. The experience is **mobile-first and portrait-oriented**, optimized for 9:16 aspect ratio sharing to Instagram Stories and TikTok.

Key format properties:
- One dominant idea per slide — never multiple sections stacked vertically
- Full-bleed background per slide — background color or gradient changes with each card
- Minimal UI chrome — no navigation bars, section labels, or persistent headers within the story
- Tap-to-advance interaction, not scroll
- Share button on every slide creates a shareable image of that exact card

[CITED: newsroom.spotify.com/2024-12-04/wrapped-user-experience-2024/]
[CITED: engineering.atspotify.com/2024/01/exploring-the-animation-landscape-of-2023-wrapped]

### Color Palette

**2024 Wrapped palette:**
- Blood red / deep crimson
- Neon hot pink / magenta (~#fb4dc2)
- Electric yellow (~#fcec03)
- Cyan blue (~#03b2f3)
- Near-black backgrounds

The palette is described as "blood red, neon pink, and canary yellow hues" that are "distinctly more dramatic than past years." Each slide often has its own dominant background color drawn from this palette — not a shared neutral background across the whole experience.

**Historical palette patterns across all years:**
- 2016–2022: Multicolor gradients, bright solid fills, vibrant greens (Spotify brand green #1DB954 was common)
- 2023: "Pixels, wiggles, plates, and shapes" with retro-pixelated elements, eclectic shapes
- 2024: Vivid neon palette, "hyperloops" of 2 and 4 as graphic motifs, maximalist
- 2025: 90s-influenced grunge/urban aesthetic — distressed textures, ripped paper edges, muted blacks and reds

The one consistent rule: **bold, saturated color is non-negotiable**. White or cream backgrounds do not appear. Dark backgrounds are most common.

[CITED: itsnicethat.com/features/spotify-wrapped-2024-graphic-design-041224]
[CITED: elements.envato.com/learn/spotify-wrapped-2024]

### Typography

**2024: Spotify Mix** — a bespoke variable font introduced in 2024. Properties:
- Ultra-bold to condensed weight range in a single typeface
- Used as a graphic element — letters loop, morph, and transform in animations
- Large width and weight variation enables both massive display type and tight condensed labels
- Rooted conceptually in "remixing" — each character has alternate forms

**General Wrapped typography rules (all years):**
- Dominant numbers are always the largest element on the slide — often 80–120px+ equivalent, taking up 40–60% of screen height
- Minimal supporting text — label beneath the number is typically 12–16px, uppercase, letter-spaced
- No body copy anywhere in the story — every text element is either a massive number, a short bold label, or a short contextualizing phrase ("you listened to X more than 99% of listeners")
- High contrast — white or bright text on dark/saturated backgrounds

[CITED: itsnicethat.com/features/spotify-wrapped-2024-graphic-design-041224]
[ASSUMED: Specific pixel sizes inferred from screenshots in design press coverage, not from Spotify's own spec docs]

### Slide Sections — 2024 Wrapped (Complete Known List)

1. **Minutes Listened** — Full-screen number, large bold display, contextualizing phrase (e.g., "that's X days of music")
2. **Top 5 Artists** — Artist photos prominent, names displayed in hierarchy (No. 1 largest, 2–5 smaller)
3. **Top 5 Songs** — Track names and artists, styled list
4. **Top Podcasts** — If applicable
5. **Longest Listening Streak** — Featured artist with streak length (days)
6. **Top Listener Percentile** — "You're in the top X% of [Artist] listeners" — one of the most screenshot-shared slides
7. **Your Music Evolution** (new in 2024) — Up to 3 "musical phases" for the year with descriptors, genres, representative artists; each phase has its own visual palette
8. **AI Podcast** (new in 2024) — NotebookLM-generated audio summary of your year; not a visual slide but an audio experience
9. **AI DJ** (Premium only) — Contextual commentary

Notable omissions from 2024: Sound Town (matched user to a city with similar taste), Listening Personality (introduced 2022, dropped 2024), Top Genres breakdown (removed; genre info moved to Music Evolution).

[CITED: newsroom.spotify.com/2024-12-04/wrapped-user-experience-2024/]
[CITED: nbcnews.com/pop-culture/spotify-wrapped-2024-new-features-what-to-know-rcna182702]

### 2025 Wrapped — New Sections (for additional reference)

Spotify 2025 expanded further with:
- **Top Artist Sprint** — Month-by-month ranking shift visualization for top 5 artists
- **Fan Leaderboard** — Global percentile ranking for your top artist
- **Clubs** — Sorts you into 1 of 6 listening style archetypes
- **Listening Archive** — AI-generated snapshots of memorable listening days
- **Top Albums** — First year albums received their own dedicated slide
- **Listening Age** — Compares musical taste to age demographic
- **Top Song Quiz** — Interactive guessing element within the story

[CITED: newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/]

### Animation Patterns

Spotify uses a hybrid animation model (documented for 2023, carried forward):

- **Lottie** for brand visuals and intro sequences — consistent across all users, complex keyframe animations
- **Native animations** (iOS/Android/web) for data visualizations — parameterized by user data
- **Count-up effects** on numbers — stat "lands" with a brief animation
- **Slide-to-slide transitions** — directional push/swipe, each slide fades or slides in with its background color
- **Artist photo reveals** — photos slide in or scale up into frame
- **Progress bars and chart animations** — bars grow from zero to value on enter

Key animation principle: "restraint." Each slide has one animated entrance per content block, not continuous looping motion. The motion serves the arrival of the stat, then settles.

[CITED: engineering.atspotify.com/2024/01/exploring-the-animation-landscape-of-2023-wrapped]

### Stat Presentation Patterns

Spotify Wrapped uses a very consistent visual grammar for presenting numbers:

| Pattern | Example | Effect |
|---------|---------|--------|
| Giant isolated number | "57,982" filling half the screen | Creates the "wow" moment |
| Percentage framing | "Top 1% of listeners" | Social comparison, braggable |
| Equivalence framing | "That's 40 days of music" | Makes abstract numbers relatable |
| Superlative label | "Your #1 Artist" in small caps | Clear hierarchy |
| Before/after contrast | Phase A vs Phase B in Music Evolution | Narrative arc |

The percentage/percentile framing ("you're in the top X%") is one of the most impactful patterns — it was introduced around 2021 and consistently returned because it drives the most social sharing.

[CITED: kapwing.com/resources/spotify-wrapped-2024-glossary-top-1-listening-characters-and-sound-towns/]
[ASSUMED: the specific year percentile framing was introduced; multiple sources confirm it is a key driver of sharing behavior]

---

## Current Implementation — What We Have

### Architecture

- **Format:** Scrollable long-form page, not story slides. Single URL per year (`/wrapped/2024`), full page layout.
- **Navigation:** Sticky year nav bar at top with year links; sections stack vertically.
- **Page count:** Two page types — `/wrapped/[year]` (per-year) and `/wrapped/all-time` (aggregate).
- **Framework:** Astro static site, data from JSON files, one React island (`HeatmapChart.tsx`).

### Visual Identity

- **Color scheme:** Cream/off-white light mode + near-black dark mode. Single accent color: ember orange-red (#e85d3a). No bold color per section.
- **Typography:** Fraunces (display serif) + Space Grotesk (sans) + JetBrains Mono (mono). No condensed or ultra-variable type.
- **Dark mode:** Fully supported with `class="dark"` toggle.
- **Motifs:** Retro/analogue aesthetic — grain overlays, spray-badge clip-path, footer extrusion shadow. This is a deliberate personal brand choice, not Spotify-styled.

### Existing Sections (per-year page)

| Component | Content | Data Source |
|-----------|---------|-------------|
| `HeroSection` | Year number (massive), total minutes, streams, artists, days active | `headline` |
| `StatsGrid` | 7 stat cards: minutes, streams, artists, tracks, albums, days active, avg min/day | `headline` |
| `TopArtistsSection` | Top 10 artists, 3-tier layout (hero / 2-5 / 6-10), artist photos if available | `topArtists` |
| `TopTracksSection` | Top 10 tracks, album art, streams+minutes, "most appearing artists" bar chart | `topTracks` |
| `TopAlbumsSection` | Top 20 albums, rank + name + artist + streams | `topAlbums` |
| `LoyaltySection` | Returning vs new artists, tiered (ride-or-die / regular / familiar / new arrivals) | `loyalty` — year=current only |
| `ClosingSection` | "That's a wrap" with prev/next year links | metadata |

Components that exist but are not currently wired into `[year].astro`:
- `BehaviorSection` (shuffle rate, skip rate, offline rate)
- `TemporalSection` (monthly bar chart, day-of-week bars, hourly bars, heatmap)
- `DiscoverySection` (new artists/tracks count, discovery rate, top new artists/tracks)
- `ExtremesSection` (longest/shortest listen, most skipped tracks)
- `StreaksSection` (longest daily streak, longest break, biggest day, most repeated track)

All five of these components exist with full implementations but are **not rendered in `[year].astro`**. They are presumably used in a different page or were temporarily removed.

### Existing Sections (all-time page)

| Component | Content |
|-----------|---------|
| `AllTimeHero` | Total minutes across all years, total streams, total years, days active |
| `YearByYearSection` | Bar chart of minutes per year, peak year highlight, clickable to year pages |
| `TopArtistsSection` | All-time top artists (shared component) |
| `TopTracksSection` | All-time top tracks (shared component) |
| `TopAlbumsSection` | All-time top albums (shared component) |
| `AllTimeLoyaltySection` | Artist loyalty across years |
| `TasteTurnoverSection` | Stacked bar chart: returning vs new artists per year, "most exploratory" / "most settled" year |
| `AllTimeClosing` | Summary closing card |

### Data Available (2024.json)

The extended history JSON is rich. Fields present:

```
headline: { totalMinutes, totalStreams, uniqueArtists, uniqueTracks, uniqueAlbums, daysActive, avgMinutesPerDay }
topArtists[]: { rank, name, minutes, streams, uniqueTracks, peakMonth }
topTracks[]: { rank, name, artist, album, minutes, streams, uri, url }   -- 50 entries
topAlbums[]: { rank, name, artist, minutes, streams, uniqueTracks, url } -- 20 entries
temporal: {
  monthly[]: { month, label, minutes, streams }
  weekly[]: { day, label, minutes, streams }
  hourly[]: { hour, minutes, streams }
  heatmap: number[][]   -- day × hour matrix
}
behavior: { shuffleRate, offlineRate, skipRate, reasonStart[], reasonEnd[] }
discovery: { newArtists, newTracks, discoveryRate, topNewArtists[], topNewTracks[] }
streaks: { longestDailyStreak, longestBreak, biggestDay, mostRepeatedTrack }
loyalty: { returning[], new[], returningCount, newCount, returningPct }
stats: (older/API snapshot format)
```

Key data fields that exist but are **not displayed** on the per-year page:
- `temporal` (all of it — monthly, weekly, hourly, heatmap)
- `behavior` (shuffle rate, skip rate, offline rate)
- `discovery` (discovery rate, new artists/tracks)
- `streaks` (streak, biggest day, most repeated track)
- `topArtists[].peakMonth` (peak listening month per artist)
- `topTracks[].minutes` (listening time per track, ranks 11–50)
- The page only shows top 10 tracks, but 50 are in the data

---

## Gap Analysis — What's Missing

### Category 1: Unwired Sections (High Impact, Zero Effort)

Five fully implemented components exist but are not mounted in `[year].astro`. This is the highest ROI improvement — just add them to the page.

| Component | What It Shows | Why It Matters |
|-----------|--------------|----------------|
| `TemporalSection` | Monthly bars, day-of-week bars, hourly histogram, full heatmap | "When you listened" is one of the most interesting personal insights — rivals Wrapped's monthly breakdown |
| `BehaviorSection` | Shuffle rate, skip rate, offline listening | Unique data Spotify's official Wrapped doesn't even expose — genuine differentiator |
| `DiscoverySection` | % of listening that was new artists/tracks, top new finds | The "explorer vs loyalist" narrative is very Wrapped-like |
| `StreaksSection` | Longest streak, biggest day, most repeated track in one day | "Records" format maps directly to Wrapped's streak slide |
| `ExtremesSection` | Longest/shortest listen, most skipped | Curiosity-driven data Wrapped doesn't do at all |

### Category 2: Presentation Format Gap (High Impact, Medium Effort)

Wrapped's core UX principle is **one stat per screen, full-bleed, mobile-first**. The current implementation is a long-form scroll page with multiple sections stacked. This is not wrong — it suits a portfolio website — but within each section, the visual presentation falls short of the impact Wrapped achieves.

Specific gaps:

**a) Number scale is undersized for hero stats**
- Current: `totalMinutes` rendered at `text-2xl md:text-3xl` in HeroSection's subtitle area
- Wrapped standard: The single most important number fills most of the visible screen
- Recommendation: The `StatsGrid` cards show numbers at `text-3xl md:text-4xl` which is better, but the hero stat (minutes listened) should be `text-7xl` or larger — comparable to the year number treatment

**b) No "equivalence framing" for abstract numbers**
- Current: "57,982 minutes listened" — no context
- Wrapped: "57,982 minutes — that's 40 days of music" (or "that's like listening non-stop for 40 days")
- Calculation: totalMinutes / 1440 = days. This is a one-line addition.

**c) No percentile or comparative framing**
- Wrapped's most-shared slide is "You're in the top X% of listeners"
- Not applicable here (this is not connected to Spotify's user base), BUT: an equivalent framing using personal history is possible
- Example: "Your highest listening year" or "Up X% vs last year" or "More than any previous year"
- This requires cross-year data which exists in all-time.json but is not pulled into year pages

**d) No color differentiation per section**
- Current: Every section uses the same cream/black + ember accent — cohesive but flat
- Wrapped: Each slide has its own dominant background color
- Recommendation: Not suggesting full replication (retro aesthetic is intentional), but subtle section-level color shifts (e.g., temporal section gets a cooler tint, streaks section gets a warmer one) would create visual rhythm

**e) Artist images absent for most years**
- Current: Artist photos only appear when `apiSnapshot.topArtists` is present; most extended-history years have no images, showing empty placeholder circles
- Impact: The #1 artist hero card loses most of its visual punch without the photo
- Recommendation: The `peakMonth` data is interesting and could replace the image as a secondary visual element; alternatively, the rank number should become the dominant visual when no image exists (currently the empty circle at opacity 0.1 is very weak)

### Category 3: Missing Stat Types (Medium Impact, Data Exists)

| Missing Stat | Data Available | Wrapped Equivalent |
|-------------|---------------|-------------------|
| "Peak month" per artist | `topArtists[].peakMonth` | N/A in Wrapped but highly personal |
| Year-over-year % change for minutes | Computable from all-time data | "You listened X% more than last year" |
| "Days that were silent" (365 - daysActive) | `headline.daysActive` | The inverse of streak — contextualizes gaps |
| Average track length distribution | trackcount/minutes ratio | N/A in Wrapped |
| Top track streams as % of total streams | `topTracks[].streams` vs `headline.totalStreams` | N/A in Wrapped |
| Hours listened (minutes / 60) | Derived from `totalMinutes` | Wrapped sometimes uses hours instead of minutes |

### Category 4: Wrapped Sections with No Data Analog

These Wrapped sections cannot be replicated without data that is not in the extended history export:

| Wrapped Feature | Why Not Feasible | Notes |
|----------------|-----------------|-------|
| "Top X% of listeners" percentile | Requires Spotify's global listener database — not in export | Only Spotify can compute this |
| Music Evolution (AI-analyzed phases) | Requires NLP/genre classification of time-sliced listening | Could be approximated with peakMonth per genre if genres were in the data |
| AI Podcast / AI DJ | LLM generation, Spotify's infrastructure | Out of scope for a static site |
| Sound Town (geographic matching) | Requires global city listening data | Not feasible |
| Fan Leaderboard | Same as percentile — requires global data | Not feasible |
| Clubs (listening style archetypes) | Requires genre data and behavior classification | Partial approximation possible with shuffleRate + discoveryRate |

---

## Recommendations — Priority Order

### P1 — Wire the Five Existing Components (Immediate)

Add to `[year].astro` in this order, after `TopAlbumsSection`:

```astro
{data.temporal && <TemporalSection temporal={data.temporal} />}
{data.streaks && <StreaksSection streaks={data.streaks} />}
{data.discovery && <DiscoverySection discovery={data.discovery} />}
{data.behavior && <BehaviorSection behavior={data.behavior} />}
{data.extremes && <ExtremesSection extremes={data.extremes} />}
```

Note: `ExtremesSection` is currently rendered as a bare `<div>` without a wrapping `<section>` tag — it should be checked whether it needs a `py-24 px-4` wrapper added or if it expects a parent to provide that.

Also restore `LoyaltySection` to all years, not just `year === new Date().getFullYear()`. The current condition is overly restrictive — loyalty data is meaningful for any year in the history.

**Estimated effort:** 30 minutes.
**Impact:** Doubles the content depth of each year page.

### P2 — Add Equivalence Framing to Hero Numbers

In `HeroSection.astro`, add a single derived line after the minutes number:

```astro
const days = Math.round(headline.totalMinutes / 1440);
const hours = Math.round(headline.totalMinutes / 60);
```

Display as: "57,982 minutes — {days} days of music" or "{hours} hours"

For `StatsGrid`, the minutes card should show the derived equivalence in a smaller line beneath the main number.

**Estimated effort:** 1 hour.
**Impact:** The single most Wrapped-feeling change possible — directly mirrors Spotify's core number-contextualizing pattern.

### P3 — Scale Up the Hero Stat Number

In `HeroSection`, the `totalMinutes` is currently in a `text-2xl md:text-3xl` line subordinate to the year number. The year number itself is already at `text-9xl`. The pattern should be:

- Year: large but secondary (it's already the URL/page title)
- Minutes: the DOMINANT stat — should be at `text-6xl md:text-7xl lg:text-8xl` minimum, with "minutes" as a small caption beneath

Consider flipping the visual hierarchy: lead with the minutes number at hero scale, place the year in the caption position.

**Estimated effort:** 1 hour (HeroSection.astro only).

### P4 — Add Year-Over-Year Comparison to Hero

For years where prior-year data is available, add a line to HeroSection that pulls comparison from the all-time data or passes it from the page:

```
+18% vs 2023  •  Your highest year
```

This requires `[year].astro` to load the adjacent year's data or the all-time summary and compute the delta. The all-time JSON's `yearByYear` array has all the data needed.

**Estimated effort:** 2–3 hours (data threading).
**Impact:** Adds the "narrative arc" dimension that makes Wrapped feel personal.

### P5 — Artist Peak Month as Secondary Visual Element

`topArtists[].peakMonth` is ignored everywhere. It's a useful humanizing detail:

- In the #1 artist hero card: "Peak month: August" shown as a badge or secondary line
- In artist cards 2–5: small `peakMonth` label in the corner

This is especially useful when artist photos are absent — the peak month gives the card a second data point to display prominently.

**Estimated effort:** 30 minutes.

### P6 — Improve Empty-Image Artist Fallback

When no artist image is available, the current fallback is a circle with `opacity: 0.1` rank number inside. This looks very weak. Better options:

- Show the rank number at `text-7xl` filling the circle at full opacity (ember red)
- Add a subtle radial gradient background per artist (generated from rank, giving each a distinct feel)
- Show `peakMonth` as an alternative visual (e.g., a month initial badge)

**Estimated effort:** 1 hour (TopArtistsSection.astro only).

### P7 — Extend Top Tracks Display to Top 20

50 tracks are in the data. The component artificially caps at 10 with `Math.min(tracks.length, 10)`. Extend to 20, and add a "Show more" toggle for the remaining 30 if desired. This is a substantive content upgrade since the extended history data is much richer than the API snapshot.

**Estimated effort:** 30 minutes.

### P8 — Add "Your Listening Personality" Derivation

Spotify dropped this feature in 2024 but it was beloved in 2022–2023. With the available data, a simplified version is computable:

```
shuffleRate + skipRate + discoveryRate → "Explorer" / "Loyalist" / "Deep Listener" / "Hit Chaser"
```

This would be a new small component (~20 lines) using `behavior.shuffleRate`, `behavior.skipRate`, and `discovery.discoveryRate` to classify the listening style into one of 4–6 archetypes with a short description.

**Estimated effort:** 2–3 hours (new component + classification logic).
**Impact:** Directly replicates a fan-favorite Wrapped feature using data already collected.

---

## Data Feasibility Map

| Spotify Wrapped Section | Implementation Status | Data Available | Effort to Add |
|------------------------|----------------------|----------------|---------------|
| Minutes listened (hero) | Exists in HeroSection | `headline.totalMinutes` | P2: add equivalence framing |
| Top 5 artists | Exists, top 10 | `topArtists[]` (20 entries) | Trivial |
| Top 5 tracks | Exists, top 10 | `topTracks[]` (50 entries) | P7: extend to 20 |
| Top albums | Exists | `topAlbums[]` | Already wired |
| Monthly listening | Built, not wired | `temporal.monthly[]` | P1: wire TemporalSection |
| Day-of-week listening | Built, not wired | `temporal.weekly[]` | P1 |
| Hourly listening | Built, not wired | `temporal.hourly[]` | P1 |
| Listening heatmap | Built, not wired | `temporal.heatmap[][]` | P1 |
| Streak / biggest day | Built, not wired | `streaks` | P1 |
| New discoveries | Built, not wired | `discovery` | P1 |
| Shuffle/skip/offline rate | Built, not wired | `behavior` | P1 |
| Extremes (longest/shortest) | Built, not wired | `extremes` | P1 |
| Loyalty tiers | Exists (current year only) | `loyalty` (all years) | Fix condition |
| Artist loyalty (all-time) | Exists in all-time page | `artistLoyalty` | N/A |
| Taste turnover evolution | Exists in all-time page | `tasteTurnover` | N/A |
| Year-over-year comparison | Not built | all-time.json `yearByYear[]` | P4 |
| Peak month per artist | Not displayed | `topArtists[].peakMonth` | P5 |
| Listening personality | Not built | derivable from behavior + discovery | P8 |
| "Top X% of listeners" | Not feasible | Not in data | Skip |
| Music Evolution phases | Not feasible | No genre time-slice data | Skip |
| Sound Town | Not feasible | No geographic data | Skip |
| AI Podcast | Not feasible | Requires LLM infrastructure | Skip |
| Top genres breakdown | Not built | Not in extended history export | Would need data pipeline change |
| Listening Age comparison | Not feasible | No demographic data | Skip |

### Critical Gap: Top Genres

Spotify Wrapped has historically included top genres as a core section. The extended history JSON **does not include genres**. Genres are not available in the Spotify Extended Streaming History export — they would need to be fetched from the Spotify API by track URI and stored. The `topTracks[].uri` field is available for all tracks, making this a feasible data enrichment step in the build pipeline, but it would be a non-trivial addition requiring API calls at data-build time.

[ASSUMED: Spotify Extended Streaming History does not include genre fields — based on known structure of the export format, but this should be verified against actual export files]

---

## Sources

### Primary (HIGH confidence)
- [Spotify Newsroom: 2024 Wrapped User Experience](https://newsroom.spotify.com/2024-12-04/wrapped-user-experience-2024/) — confirmed section list for 2024
- [Spotify Engineering: Animation Landscape of 2023 Wrapped](https://engineering.atspotify.com/2024/01/exploring-the-animation-landscape-of-2023-wrapped) — confirmed Lottie + native animation architecture
- [Spotify Newsroom: 2025 Wrapped User Experience](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/) — confirmed 2025 section list

### Secondary (MEDIUM confidence)
- [It's Nice That: Inside the design of Spotify Wrapped 2024](https://www.itsnicethat.com/features/spotify-wrapped-2024-graphic-design-041224) — typography (Spotify Mix font), color palette, design philosophy — corroborated by Spotify's own press releases
- [NBC News: Spotify Wrapped 2024 new features](https://www.nbcnews.com/pop-culture/spotify-wrapped-2024-new-features-what-to-know-rcna182702) — confirmed Music Evolution and notable omissions
- [Envato Elements: Spotify Wrapped 2024 aesthetic](https://elements.envato.com/learn/spotify-wrapped-2024) — color palette and design evolution history

### Tertiary (LOW confidence / supporting)
- [Alex Jimenez Design: Three design elements that made Wrapped 2024 great](https://alexjimenezdesign.medium.com/three-design-elements-that-made-spotify-wrapped-2024-great-0a8e2b133b72) — general design analysis
- [Kapwing: Spotify Wrapped 2024 glossary](https://www.kapwing.com/resources/spotify-wrapped-2024-glossary-top-1-listening-characters-and-sound-towns/) — percentile framing details
