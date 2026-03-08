#!/usr/bin/env node

/**
 * Fetches top tracks from Spotify, deduplicates by album,
 * and writes the top 12 unique albums to src/data/listening.json.
 *
 * Environment variables required:
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "../src/data/listening.json");

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
  process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  console.error(
    "Missing required environment variables: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN"
  );
  process.exit(1);
}

/**
 * Exchange refresh token for a fresh access token.
 */
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

/**
 * Fetch top tracks (medium_term = ~6 months).
 */
async function getTopTracks(accessToken) {
  const res = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Top tracks request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.items;
}

/**
 * Deduplicate tracks by album and pick the top 12 unique albums.
 */
function extractAlbums(tracks) {
  const seen = new Set();
  const albums = [];

  for (const track of tracks) {
    const album = track.album;
    if (!album || seen.has(album.id)) continue;
    seen.add(album.id);

    // Pick the 640px cover image (first in the array, largest)
    const cover =
      album.images.find((img) => img.width === 640)?.url ||
      album.images[0]?.url ||
      "";

    albums.push({
      title: album.name,
      artist: album.artists.map((a) => a.name).join(", "),
      cover,
      url: album.external_urls.spotify,
    });

    if (albums.length >= 12) break;
  }

  return albums;
}

async function main() {
  console.log("Refreshing Spotify access token...");
  const accessToken = await getAccessToken();

  console.log("Fetching top tracks (medium_term, limit 50)...");
  const tracks = await getTopTracks(accessToken);
  console.log(`Received ${tracks.length} tracks.`);

  const albums = extractAlbums(tracks);
  console.log(`Extracted ${albums.length} unique albums.`);

  writeFileSync(OUTPUT_PATH, JSON.stringify(albums, null, 2) + "\n");
  console.log(`Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
