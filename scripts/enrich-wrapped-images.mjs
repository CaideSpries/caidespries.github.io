#!/usr/bin/env node

/**
 * Enriches wrapped year JSON files with Spotify image URLs.
 *
 * For each year in src/data/wrapped/YYYY.json that uses source=extended_history
 * and lacks image data, this script:
 *   - Looks up each top artist by name via the Spotify search API → adds image URL
 *   - Looks up each top track by its stored Spotify URI → adds albumArt URL
 *   - Writes the results into apiSnapshot.topArtists / apiSnapshot.topTracks
 *
 * The [year].astro page merges these image fields at build time via the
 * apiSnapshot mechanism, so no component changes are needed.
 *
 * Usage:
 *   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... SPOTIFY_REFRESH_TOKEN=... \
 *     node scripts/enrich-wrapped-images.mjs [year]
 *
 * If [year] is omitted, all years are processed.
 *
 * Environment variables required:
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../src/data/wrapped");

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
  process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  console.error(
    "Missing required environment variables: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Get a user OAuth token (refresh_token flow). Used for artist search.
 */
async function getUserToken() {
  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Get a client credentials token. Works for public catalog lookups
 * (search by track name/artist, album art, etc.) without user context.
 */
async function getClientToken() {
  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Client credentials token failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Spotify helpers
// ---------------------------------------------------------------------------

function pickImage(images) {
  if (!images || images.length === 0) return "";
  return images.find((img) => img.width === 640)?.url || images[0]?.url || "";
}

const MAX_RETRIES = 3;

async function spotifyGet(url, accessToken) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("Retry-After") ?? "30", 10);
      if (retryAfter > 300) {
        // Daily quota exhausted — not worth waiting. Throw so the caller records
        // an empty result and we move on rather than blocking for hours.
        throw new Error(
          `Spotify API error (429): daily quota exhausted (Retry-After: ${retryAfter}s). ` +
            `Re-run this script tomorrow to fill in remaining images.`
        );
      }
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Spotify API error (429): rate limited after ${MAX_RETRIES} attempts. ` +
            `Re-run this script to resume.`
        );
      }
      // Short-term rate limit — wait and retry.
      console.log(`\n  Rate limited — waiting ${retryAfter}s before retry (attempt ${attempt}/${MAX_RETRIES})...`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Spotify API error (${res.status}): ${text}`);
    }
    return res.json();
  }
}

/** Search for an artist by exact name, return the best-match image URL. */
async function lookupArtistImage(name, accessToken) {
  const query = encodeURIComponent(name);
  const data = await spotifyGet(
    `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=5`,
    accessToken
  );
  const artists = data.artists?.items ?? [];
  // Prefer exact name match (case-insensitive)
  const exact = artists.find(
    (a) => a.name.toLowerCase() === name.toLowerCase()
  );
  const pick = exact || artists[0];
  if (!pick) return { image: "", url: "" };
  return {
    image: pickImage(pick.images),
    url: pick.external_urls?.spotify || "",
  };
}

/**
 * Search for a track by name + artist using the Spotify search API.
 * Returns { albumArt, url } for the best match.
 *
 * Note: The /v1/tracks batch endpoint requires a market parameter and returns
 * 403 with user-scoped tokens. Search works reliably with both token types.
 */
async function lookupTrackImage(name, artist, accessToken) {
  const q = encodeURIComponent(`track:${name} artist:${artist}`);
  const data = await spotifyGet(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=5`,
    accessToken
  );
  const tracks = data.tracks?.items ?? [];
  // Prefer exact match on both track name and artist (case-insensitive)
  const nameLower = name.toLowerCase();
  const artistLower = artist.toLowerCase();
  const exact = tracks.find(
    (t) =>
      t.name.toLowerCase() === nameLower &&
      t.artists.some((a) => a.name.toLowerCase() === artistLower)
  );
  const pick = exact || tracks[0];
  if (!pick) return { albumArt: "", url: "" };
  return {
    albumArt: pickImage(pick.album?.images ?? []),
    url: pick.external_urls?.spotify || "",
  };
}

// ---------------------------------------------------------------------------
// Per-year enrichment
// ---------------------------------------------------------------------------

async function enrichYear(filePath, accessToken) {
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));

  if (raw.source !== "extended_history") {
    console.log(`  Skipping (source=${raw.source})`);
    return;
  }

  const topArtists = raw.topArtists ?? raw.artists ?? [];
  const topTracks = raw.topTracks ?? raw.tracks ?? [];

  if (topArtists.length === 0 && topTracks.length === 0) {
    console.log("  No artists or tracks — nothing to enrich");
    return;
  }

  // Check if already fully enriched. A year is considered complete when:
  // - apiSnapshot.topArtists exists with images for all top artists, AND
  // - apiSnapshot.topTracks exists with images for most tracks (>=80%)
  // Partially enriched years (from a rate-limited run) are re-processed.
  const snap = raw.apiSnapshot;
  if (snap?.topArtists?.length > 0 && snap?.topTracks?.length > 0) {
    const artistsComplete = snap.topArtists.every((a) => a.image);
    const tracksWithArt = snap.topTracks.filter((t) => t.albumArt).length;
    const tracksComplete = tracksWithArt / snap.topTracks.length >= 0.8;
    if (artistsComplete && tracksComplete) {
      console.log(
        `  Already fully enriched (${snap.topArtists.length} artists, ${tracksWithArt}/${snap.topTracks.length} tracks) — skipping`
      );
      return;
    }
    console.log(
      `  Partially enriched (artists: ${snap.topArtists.filter((a) => a.image).length}/${snap.topArtists.length}, tracks: ${tracksWithArt}/${snap.topTracks.length}) — re-enriching`
    );
  }

  // --- Enrich artists ---
  console.log(`  Looking up ${topArtists.length} artists...`);
  const enrichedArtists = [];
  for (const artist of topArtists) {
    process.stdout.write(`    ${artist.name}...`);
    try {
      const { image, url } = await lookupArtistImage(artist.name, accessToken);
      enrichedArtists.push({ name: artist.name, image, url });
      console.log(image ? " got image" : " no image");
    } catch (err) {
      console.log(` error: ${err.message}`);
      enrichedArtists.push({ name: artist.name, image: "", url: "" });
    }
    // Rate-limit courtesy pause (500ms keeps well under Spotify's ~180 req/min limit)
    await new Promise((r) => setTimeout(r, 500));
  }

  // --- Enrich tracks ---
  // Use search by name+artist. The /v1/tracks batch endpoint returns 403 with
  // the user-scoped token (only has user-top-read scope); search works fine.
  console.log(`  Looking up ${topTracks.length} tracks via search...`);
  const enrichedTracks = [];
  let trackFound = 0;
  for (const t of topTracks) {
    process.stdout.write(`    ${t.name}...`);
    try {
      const { albumArt, url } = await lookupTrackImage(t.name, t.artist, accessToken);
      enrichedTracks.push({
        name: t.name,
        artist: t.artist,
        albumArt,
        url: url || t.url || "",
      });
      if (albumArt) trackFound++;
      console.log(albumArt ? " got image" : " no image");
    } catch (err) {
      console.log(` error: ${err.message}`);
      enrichedTracks.push({ name: t.name, artist: t.artist, albumArt: "", url: t.url || "" });
    }
    // Rate-limit courtesy pause (500ms keeps well under Spotify's ~180 req/min limit)
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log(`  Got album art for ${trackFound}/${topTracks.length} tracks`);

  // Write apiSnapshot back into the file
  const updated = {
    ...raw,
    apiSnapshot: {
      topArtists: enrichedArtists,
      topTracks: enrichedTracks,
    },
  };

  writeFileSync(filePath, JSON.stringify(updated, null, 2) + "\n");
  console.log(`  Written updated file.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const targetYear = process.argv[2]; // optional: "2024"

  // Use user token for artist search (works fine with user-top-read scope).
  // Client credentials token also works for search but is only needed if
  // the user token stops working for catalog lookups.
  console.log("Refreshing Spotify access token...");
  const accessToken = await getUserToken();
  console.log("Token obtained.\n");

  const files = readdirSync(DATA_DIR)
    .filter((f) => /^\d{4}\.json$/.test(f))
    .sort();

  for (const file of files) {
    const year = file.replace(".json", "");
    if (targetYear && year !== targetYear) continue;

    console.log(`Processing ${year}...`);
    try {
      await enrichYear(resolve(DATA_DIR, file), accessToken);
    } catch (err) {
      console.error(`  Error processing ${year}: ${err.message}`);
    }
    console.log();
  }

  console.log("Done. Run `npm run build` to rebuild the site.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
