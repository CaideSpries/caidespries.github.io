#!/usr/bin/env node

/**
 * Builds src/data/wrapped/index.json manifest from all per-year files.
 *
 * Usage: node scripts/build-wrapped-index.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRAPPED_DIR = resolve(__dirname, "../src/data/wrapped");

function main() {
  const files = readdirSync(WRAPPED_DIR)
    .filter((f) => /^\d{4}\.json$/.test(f))
    .sort();

  if (files.length === 0) {
    console.error("No year files found in", WRAPPED_DIR);
    process.exit(1);
  }

  const years = [];
  let totalMinutes = 0;
  let totalStreams = 0;

  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(WRAPPED_DIR, file), "utf-8"));

    const entry = {
      year: data.year,
      source: data.source,
      lastUpdated: data.lastUpdated,
      topArtist: data.topArtists?.[0]?.name,
      topTrack: data.topTracks?.[0]?.name,
    };

    if (data.headline) {
      entry.totalMinutes = data.headline.totalMinutes;
      entry.totalStreams = data.headline.totalStreams;
      entry.uniqueArtists = data.headline.uniqueArtists;
      totalMinutes += data.headline.totalMinutes;
      totalStreams += data.headline.totalStreams;
    } else if (data.stats) {
      entry.uniqueArtists = data.stats.uniqueArtists;
    }

    years.push(entry);
  }

  const index = {
    years,
    allTime: {
      totalMinutes: totalMinutes || undefined,
      totalStreams: totalStreams || undefined,
      totalYears: years.length,
      firstYear: years[0]?.year,
      latestYear: years[years.length - 1]?.year,
    },
  };

  writeFileSync(
    resolve(WRAPPED_DIR, "index.json"),
    JSON.stringify(index, null, 2) + "\n"
  );

  console.log(`Built index.json with ${years.length} years`);
  for (const y of years) {
    console.log(`  ${y.year} (${y.source}) — ${y.topArtist || "no data"}`);
  }
}

main();
