#!/usr/bin/env node

/**
 * Processes Spotify Extended Streaming History into per-year wrapped data files.
 *
 * Input:  src/data/raw/endsong_*.json (from Spotify data export)
 * Output: src/data/wrapped/YYYY.json for each year
 *
 * Usage: node scripts/process-history.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = resolve(__dirname, "../src/data/raw");
const OUTPUT_DIR = resolve(__dirname, "../src/data/wrapped");

const MIN_MS_PLAYED = 30000; // 30s minimum to count as a stream

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function loadStreams() {
  const files = readdirSync(RAW_DIR)
    .filter((f) => f.startsWith("endsong_") && f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.error("No endsong_*.json files found in", RAW_DIR);
    process.exit(1);
  }

  console.log(`Found ${files.length} history files`);

  const streams = [];
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(RAW_DIR, file), "utf-8"));
    streams.push(...data);
  }

  console.log(`Loaded ${streams.length} total entries`);

  // Filter: music only (not podcasts), meaningful plays
  return streams.filter(
    (s) => s.master_metadata_track_name && s.ms_played >= MIN_MS_PLAYED
  );
}

function groupByYear(streams) {
  const years = {};
  for (const s of streams) {
    const year = new Date(s.ts).getFullYear();
    if (!years[year]) years[year] = [];
    years[year].push(s);
  }
  return years;
}

function computeYearStats(streams, allPriorArtists, allPriorTracks) {
  const totalMs = streams.reduce((sum, s) => sum + s.ms_played, 0);
  const totalMinutes = Math.round(totalMs / 60000);

  const artistSet = new Set();
  const trackSet = new Set();
  const albumSet = new Set();
  const daySet = new Set();

  const artistMinutes = {};
  const artistStreams = {};
  const artistTracks = {};
  const artistMonthly = {};

  const trackMinutes = {};
  const trackStreams = {};
  const trackInfo = {};

  const albumMinutes = {};
  const albumStreams = {};
  const albumTracks = {};
  const albumInfo = {};

  const monthlyMinutes = Array(12).fill(0);
  const monthlyStreams = Array(12).fill(0);
  const weeklyMinutes = Array(7).fill(0);
  const weeklyStreams = Array(7).fill(0);
  const hourlyMinutes = Array(24).fill(0);
  const hourlyStreams = Array(24).fill(0);
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

  let shuffleCount = 0;
  let offlineCount = 0;
  let skippedCount = 0;
  const reasonStart = {};
  const reasonEnd = {};

  const dailyMinutes = {};

  for (const s of streams) {
    const artist = s.master_metadata_album_artist_name || "Unknown";
    const track = s.master_metadata_track_name;
    const album = s.master_metadata_album_album_name || "Unknown";
    const trackKey = `${track}|||${artist}`;
    const albumKey = `${album}|||${artist}`;
    const minutes = s.ms_played / 60000;
    const dt = new Date(s.ts);
    const month = dt.getMonth();
    const day = dt.getDay();
    const hour = dt.getHours();
    const dateStr = s.ts.substring(0, 10);

    artistSet.add(artist);
    trackSet.add(trackKey);
    albumSet.add(albumKey);
    daySet.add(dateStr);

    artistMinutes[artist] = (artistMinutes[artist] || 0) + minutes;
    artistStreams[artist] = (artistStreams[artist] || 0) + 1;
    if (!artistTracks[artist]) artistTracks[artist] = new Set();
    artistTracks[artist].add(trackKey);
    if (!artistMonthly[artist]) artistMonthly[artist] = Array(12).fill(0);
    artistMonthly[artist][month] += minutes;

    trackMinutes[trackKey] = (trackMinutes[trackKey] || 0) + minutes;
    trackStreams[trackKey] = (trackStreams[trackKey] || 0) + 1;
    if (!trackInfo[trackKey]) {
      trackInfo[trackKey] = {
        name: track,
        artist,
        album,
        uri: s.spotify_track_uri,
      };
    }

    albumMinutes[albumKey] = (albumMinutes[albumKey] || 0) + minutes;
    albumStreams[albumKey] = (albumStreams[albumKey] || 0) + 1;
    if (!albumTracks[albumKey]) albumTracks[albumKey] = new Set();
    albumTracks[albumKey].add(trackKey);
    if (!albumInfo[albumKey]) albumInfo[albumKey] = { name: album, artist };

    monthlyMinutes[month] += minutes;
    monthlyStreams[month] += 1;
    weeklyMinutes[day] += minutes;
    weeklyStreams[day] += 1;
    hourlyMinutes[hour] += minutes;
    hourlyStreams[hour] += 1;
    heatmap[day][hour] += minutes;

    if (s.shuffle) shuffleCount++;
    if (s.offline) offlineCount++;
    if (s.skipped) skippedCount++;
    if (s.reason_start)
      reasonStart[s.reason_start] =
        (reasonStart[s.reason_start] || 0) + 1;
    if (s.reason_end)
      reasonEnd[s.reason_end] = (reasonEnd[s.reason_end] || 0) + 1;

    dailyMinutes[dateStr] = (dailyMinutes[dateStr] || 0) + minutes;
  }

  const totalStreams = streams.length;
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // --- Headline ---
  const headline = {
    totalMinutes,
    totalStreams,
    uniqueArtists: artistSet.size,
    uniqueTracks: trackSet.size,
    uniqueAlbums: albumSet.size,
    daysActive: daySet.size,
    avgMinutesPerDay: Math.round(totalMinutes / daySet.size),
  };

  // --- Top Artists (20) ---
  const topArtists = Object.entries(artistMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, mins], i) => {
      const monthly = artistMonthly[name];
      const peakMonth = monthly.indexOf(Math.max(...monthly));
      return {
        rank: i + 1,
        name,
        minutes: Math.round(mins),
        streams: artistStreams[name],
        uniqueTracks: artistTracks[name].size,
        peakMonth: monthNames[peakMonth],
      };
    });

  // --- Top Tracks (50) ---
  const topTracks = Object.entries(trackStreams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([key, count], i) => {
      const info = trackInfo[key];
      return {
        rank: i + 1,
        name: info.name,
        artist: info.artist,
        album: info.album,
        minutes: Math.round(trackMinutes[key]),
        streams: count,
        uri: info.uri,
      };
    });

  // --- Top Albums (20) ---
  const topAlbums = Object.entries(albumMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, mins], i) => {
      const info = albumInfo[key];
      return {
        rank: i + 1,
        name: info.name,
        artist: info.artist,
        minutes: Math.round(mins),
        streams: albumStreams[key],
        uniqueTracks: albumTracks[key].size,
      };
    });

  // --- Temporal ---
  const temporal = {
    monthly: monthlyMinutes.map((mins, i) => ({
      month: i + 1,
      label: monthNames[i],
      minutes: Math.round(mins),
      streams: monthlyStreams[i],
    })),
    weekly: weeklyMinutes.map((mins, i) => ({
      day: i,
      label: dayNames[i],
      minutes: Math.round(mins),
      streams: weeklyStreams[i],
    })),
    hourly: hourlyMinutes.map((mins, i) => ({
      hour: i,
      minutes: Math.round(mins),
      streams: hourlyStreams[i],
    })),
    heatmap: heatmap.map((row) => row.map((v) => Math.round(v))),
  };

  // --- Behavior ---
  const behavior = {
    shuffleRate: +(shuffleCount / totalStreams).toFixed(3),
    offlineRate: +(offlineCount / totalStreams).toFixed(3),
    skipRate: +(skippedCount / totalStreams).toFixed(3),
    reasonStart: Object.entries(reasonStart)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({ reason, count })),
    reasonEnd: Object.entries(reasonEnd)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({ reason, count })),
  };

  // --- Streaks ---
  const sortedDays = Object.keys(dailyMinutes).sort();
  let longestStreak = { days: 0, start: "", end: "" };
  let currentStreak = {
    days: 1,
    start: sortedDays[0],
    end: sortedDays[0],
  };
  let longestBreak = { days: 0, start: "", end: "" };

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = Math.round((curr - prev) / 86400000);

    if (diffDays === 1) {
      currentStreak.days++;
      currentStreak.end = sortedDays[i];
    } else {
      if (currentStreak.days > longestStreak.days)
        longestStreak = { ...currentStreak };
      if (diffDays - 1 > longestBreak.days)
        longestBreak = {
          days: diffDays - 1,
          start: sortedDays[i - 1],
          end: sortedDays[i],
        };
      currentStreak = { days: 1, start: sortedDays[i], end: sortedDays[i] };
    }
  }
  if (currentStreak.days > longestStreak.days)
    longestStreak = { ...currentStreak };

  const biggestDayEntry = Object.entries(dailyMinutes).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Most repeated track in a single day
  const dailyTrackCounts = {};
  for (const s of streams) {
    const dateStr = s.ts.substring(0, 10);
    const trackKey = `${s.master_metadata_track_name}|||${s.master_metadata_album_artist_name || "Unknown"}`;
    const dayTrackKey = `${dateStr}|||${trackKey}`;
    dailyTrackCounts[dayTrackKey] = (dailyTrackCounts[dayTrackKey] || 0) + 1;
  }
  const mostRepeatedEntry = Object.entries(dailyTrackCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  let mostRepeatedTrack = null;
  if (mostRepeatedEntry) {
    const [key, count] = mostRepeatedEntry;
    const parts = key.split("|||");
    mostRepeatedTrack = {
      name: parts[1],
      artist: parts[2],
      count,
      date: parts[0],
    };
  }

  const streaks = {
    longestDailyStreak: longestStreak,
    longestBreak,
    biggestDay: biggestDayEntry
      ? { date: biggestDayEntry[0], minutes: Math.round(biggestDayEntry[1]) }
      : null,
    mostRepeatedTrack,
  };

  // --- Discovery ---
  const newArtists = [...artistSet].filter((a) => !allPriorArtists.has(a));
  const newTracks = [...trackSet].filter((t) => !allPriorTracks.has(t));

  const topNewArtists = newArtists
    .map((a) => ({ name: a, minutes: Math.round(artistMinutes[a]) }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  const topNewTracks = newTracks
    .map((key) => {
      const info = trackInfo[key];
      return {
        name: info.name,
        artist: info.artist,
        streams: trackStreams[key],
      };
    })
    .sort((a, b) => b.streams - a.streams)
    .slice(0, 10);

  const discovery = {
    newArtists: newArtists.length,
    newTracks: newTracks.length,
    discoveryRate: +(newArtists.length / artistSet.size).toFixed(3),
    topNewArtists,
    topNewTracks,
  };

  // --- Extremes ---
  const longestListen = streams.reduce((a, b) =>
    a.ms_played > b.ms_played ? a : b
  );
  const shortestListen = streams.reduce((a, b) =>
    a.ms_played < b.ms_played ? a : b
  );

  const skippedTracks = {};
  for (const s of streams) {
    if (s.skipped) {
      const key = `${s.master_metadata_track_name}|||${s.master_metadata_album_artist_name || "Unknown"}`;
      skippedTracks[key] = (skippedTracks[key] || 0) + 1;
    }
  }
  const mostSkipped = Object.entries(skippedTracks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => {
      const [name, artist] = key.split("|||");
      return { name, artist, count };
    });

  const extremes = {
    longestListen: {
      name: longestListen.master_metadata_track_name,
      artist: longestListen.master_metadata_album_artist_name,
      duration: formatDuration(longestListen.ms_played),
    },
    shortestListen: {
      name: shortestListen.master_metadata_track_name,
      artist: shortestListen.master_metadata_album_artist_name,
      duration: formatDuration(shortestListen.ms_played),
    },
    mostSkipped,
  };

  return {
    headline,
    topArtists,
    topTracks,
    topAlbums,
    temporal,
    behavior,
    streaks,
    discovery,
    extremes,
  };
}

function main() {
  if (!existsSync(RAW_DIR)) {
    console.error(`Raw data directory not found: ${RAW_DIR}`);
    console.error(
      "Place your Spotify Extended Streaming History files (endsong_*.json) there."
    );
    process.exit(1);
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const streams = loadStreams();
  console.log(`${streams.length} qualifying streams after filtering`);

  const yearGroups = groupByYear(streams);
  const years = Object.keys(yearGroups).map(Number).sort();
  console.log(`Years: ${years.join(", ")}`);

  const allPriorArtists = new Set();
  const allPriorTracks = new Set();

  for (const year of years) {
    const yearStreams = yearGroups[year];
    console.log(`\nProcessing ${year}: ${yearStreams.length} streams`);

    const stats = computeYearStats(
      yearStreams,
      allPriorArtists,
      allPriorTracks
    );

    // Merge with existing API snapshot data if present
    const existingPath = resolve(OUTPUT_DIR, `${year}.json`);
    let apiSnapshot = null;
    if (existsSync(existingPath)) {
      try {
        const existing = JSON.parse(readFileSync(existingPath, "utf-8"));
        if (existing.source === "api_snapshot") {
          apiSnapshot = {
            topArtists: existing.topArtists,
            topTracks: existing.topTracks,
          };
        } else if (existing.apiSnapshot) {
          apiSnapshot = existing.apiSnapshot;
        }
      } catch {
        // ignore parse errors
      }
    }

    const yearData = {
      year,
      source: "extended_history",
      lastUpdated: new Date().toISOString(),
      ...stats,
      ...(apiSnapshot ? { apiSnapshot } : {}),
    };

    writeFileSync(
      resolve(OUTPUT_DIR, `${year}.json`),
      JSON.stringify(yearData, null, 2) + "\n"
    );
    console.log(
      `  Written ${year}.json — ${stats.headline.totalMinutes} min, ${stats.headline.totalStreams} streams, ${stats.headline.uniqueArtists} artists`
    );

    // Update prior sets for discovery tracking
    for (const s of yearStreams) {
      allPriorArtists.add(
        s.master_metadata_album_artist_name || "Unknown"
      );
      allPriorTracks.add(
        `${s.master_metadata_track_name}|||${s.master_metadata_album_artist_name || "Unknown"}`
      );
    }
  }

  console.log(
    "\nDone! Run `node scripts/build-wrapped-index.mjs` to update the manifest."
  );
}

main();
