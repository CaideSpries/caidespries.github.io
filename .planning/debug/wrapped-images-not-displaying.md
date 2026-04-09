---
status: awaiting_human_verify
trigger: "Album/artist images render correctly in the #listening section on the homepage but do not display on Spotify Wrapped year pages (/wrapped/[year])."
created: 2026-04-07T00:00:00Z
updated: 2026-04-07T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — all wrapped JSON data files lack image fields entirely. The components render images conditionally (artist.image / track.albumArt), so no images are shown because the data never had them. The apiSnapshot mechanism in [year].astro exists precisely to backfill images from a Spotify API call, but in 2025 the apiSnapshot object is empty ({}), and all other years have no apiSnapshot at all.
test: verified by inspecting all 9 year JSON files
expecting: fix requires populating image URLs in the JSON data, either by running an API enrichment script or adding a hardcoded apiSnapshot with image URLs
next_action: check if there is an enrichment/fetch script; then fix the data or the fallback logic

## Symptoms

expected: Album art and artist images display on /wrapped/[year] pages, the same way they appear in the #listening section on the homepage
actual: Images do not display on the wrapped year pages
errors: none reported
reproduction: Visit /wrapped/[year] on the site and observe missing images
started: Unknown — may never have worked correctly

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-04-07
  checked: all wrapped JSON files (2018–2026)
  found: No year has artist.image or track.albumArt fields. Every year uses source=extended_history. 2025 has an apiSnapshot key but its value is an empty object {}. All other years have no apiSnapshot at all.
  implication: The components' conditional image rendering (artist.image ? <img> : <placeholder>) always takes the placeholder branch — this is a data gap, not a rendering bug.

- timestamp: 2026-04-07
  checked: [year].astro merge logic
  found: The page merges apiSnapshot.topArtists/topTracks into displayArtists/displayTracks only when data.source === "extended_history" && data.apiSnapshot has entries. Since apiSnapshot is always empty or absent, the merge never fires and image fields stay undefined.
  implication: The apiSnapshot merge path is the intended solution but was never populated with real data.

- timestamp: 2026-04-07
  checked: TopAlbumsSection.astro Album interface
  found: No image/cover field exists on the Album type — albums are text-only cards by design.
  implication: The image problem is limited to artists and tracks.

## Resolution

root_cause: The wrapped year JSON data files contain no image URLs. All 9 years (2018–2026) derive from extended Spotify history exports which do not include image data. The [year].astro page has an apiSnapshot merge mechanism to backfill images from a Spotify API call, but the apiSnapshot is either absent or empty ({}) in every year's JSON. The rendering components correctly fall back to placeholder divs when image fields are missing.
fix: Created scripts/enrich-wrapped-images.mjs which calls the Spotify search API for each artist (by name) and each track (by name+artist) and writes the resulting image URLs into apiSnapshot.topArtists / apiSnapshot.topTracks in each year's JSON. The [year].astro page already contains the merge logic to apply these at build time — no component changes needed. Ran the script; 2018–2022 and 2024 are fully enriched. 2023, 2025, 2026 hit Spotify's daily rate limit (Retry-After: ~24h) and need a re-run tomorrow.
verification: awaiting build check and re-run for remaining years
files_changed:
  - scripts/enrich-wrapped-images.mjs (created)
  - src/data/wrapped/2018.json (apiSnapshot added)
  - src/data/wrapped/2019.json (apiSnapshot added)
  - src/data/wrapped/2020.json (apiSnapshot added)
  - src/data/wrapped/2021.json (apiSnapshot added)
  - src/data/wrapped/2022.json (apiSnapshot added)
  - src/data/wrapped/2024.json (apiSnapshot added)
