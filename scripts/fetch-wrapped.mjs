#!/usr/bin/env node

/**
 * Fetches top artists, tracks, and computed stats from Spotify
 * (medium_term ~ last 6 months) and writes to src/data/wrapped/YYYY.json.
 *
 * Environment variables required:
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "../src/data/wrapped");

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
  process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  console.error(
    "Missing required environment variables: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN"
  );
  process.exit(1);
}

async function getAccessToken() {
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

async function spotifyGet(url, accessToken) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify API error (${res.status}): ${text}`);
  }
  return res.json();
}

function pickImage(images) {
  return (
    images.find((img) => img.width === 640)?.url || images[0]?.url || ""
  );
}

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Refreshing Spotify access token...");
  const accessToken = await getAccessToken();

  console.log("Fetching top artists (medium_term, limit 10)...");
  const rawArtists = (
    await spotifyGet(
      "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10",
      accessToken
    )
  ).items;
  console.log(`Received ${rawArtists.length} artists.`);

  console.log("Fetching top tracks (medium_term, limit 50)...");
  const rawTracks = (
    await spotifyGet(
      "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50",
      accessToken
    )
  ).items;
  console.log(`Received ${rawTracks.length} tracks.`);

  const artists = rawArtists.map((a, i) => ({
    rank: i + 1,
    name: a.name,
    image: pickImage(a.images),
    url: a.external_urls.spotify,
  }));

  const tracks = rawTracks.map((t, i) => ({
    rank: i + 1,
    name: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album.name,
    albumArt: pickImage(t.album.images),
    url: t.external_urls.spotify,
    durationMs: t.duration_ms,
    duration: formatDuration(t.duration_ms),
    explicit: t.explicit || false,
  }));

  const allTrackArtists = rawTracks.flatMap((t) =>
    t.artists.map((a) => a.name)
  );
  const artistFrequency = {};
  for (const name of allTrackArtists) {
    artistFrequency[name] = (artistFrequency[name] || 0) + 1;
  }
  const topTrackArtists = Object.entries(artistFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const uniqueAlbums = new Set(rawTracks.map((t) => t.album.name));
  const uniqueArtists = new Set(allTrackArtists);

  const totalDurationMs = rawTracks.reduce(
    (sum, t) => sum + (t.duration_ms || 0),
    0
  );
  const avgDurationMs = Math.round(totalDurationMs / rawTracks.length);

  const longestTrack = rawTracks.reduce((a, b) =>
    a.duration_ms > b.duration_ms ? a : b
  );
  const shortestTrack = rawTracks.reduce((a, b) =>
    a.duration_ms < b.duration_ms ? a : b
  );

  const decadeCounts = {};
  for (const t of rawTracks) {
    const year = parseInt(t.album.release_date?.substring(0, 4));
    if (year) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    }
  }
  const topDecades = Object.entries(decadeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([decade, count]) => ({ decade, count }));

  const currentYear = new Date().getFullYear();

  const wrapped = {
    year: currentYear,
    source: "api_snapshot",
    fetchedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    artists,
    tracks: tracks.slice(0, 20),
    topArtists: artists,
    topTracks: tracks.slice(0, 20),
    stats: {
      totalTracks: rawTracks.length,
      uniqueArtists: uniqueArtists.size,
      uniqueAlbums: uniqueAlbums.size,
      totalDurationMs,
      totalDuration: formatDuration(totalDurationMs),
      avgTrackDuration: formatDuration(avgDurationMs),
      longestTrack: {
        name: longestTrack.name,
        artist: longestTrack.artists.map((a) => a.name).join(", "),
        duration: formatDuration(longestTrack.duration_ms),
      },
      shortestTrack: {
        name: shortestTrack.name,
        artist: shortestTrack.artists.map((a) => a.name).join(", "),
        duration: formatDuration(shortestTrack.duration_ms),
      },
      topTrackArtists,
      decades: topDecades,
    },
  };

  const outputPath = resolve(OUTPUT_DIR, `${currentYear}.json`);
  writeFileSync(outputPath, JSON.stringify(wrapped, null, 2) + "\n");
  console.log(`Written to ${outputPath}`);
  console.log(`\nStats:`);
  console.log(
    `  ${uniqueArtists.size} unique artists across ${rawTracks.length} tracks`
  );
  console.log(`  ${uniqueAlbums.size} unique albums`);
  console.log(`  Total duration: ${formatDuration(totalDurationMs)}`);

  // Rebuild index
  console.log("\nRebuilding index...");
  const { execSync } = await import("node:child_process");
  execSync("node scripts/build-wrapped-index.mjs", {
    cwd: resolve(__dirname, ".."),
    stdio: "inherit",
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
