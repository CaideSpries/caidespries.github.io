#!/usr/bin/env node

/**
 * Processes Spotify Extended Streaming History into per-year wrapped data files.
 *
 * Input:  src/data/raw/endsong_*.json OR Streaming_History_Audio_*.json
 * Output: src/data/wrapped/YYYY.json for each year
 *         src/data/wrapped/all-time.json for cumulative stats
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
const LOYALTY_TOP_N = 50; // Artist must be in top N by minutes to count as "present"

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function loadStreams() {
  const files = readdirSync(RAW_DIR)
    .filter(
      (f) =>
        f.endsWith(".json") &&
        (f.startsWith("endsong_") || f.startsWith("Streaming_History_Audio_"))
    )
    .sort();

  if (files.length === 0) {
    console.error("No streaming history files found in", RAW_DIR);
    console.error(
      "Expected endsong_*.json or Streaming_History_Audio_*.json files."
    );
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

  // --- Top N artists for loyalty tracking ---
  const topNArtists = Object.entries(artistMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, LOYALTY_TOP_N)
    .map(([name]) => name);

  // --- Top Tracks (50) ---
  const topTracks = Object.entries(trackStreams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([key, count], i) => {
      const info = trackInfo[key];
      const uri = info.uri;
      const trackId = uri ? uri.replace("spotify:track:", "") : null;
      return {
        rank: i + 1,
        name: info.name,
        artist: info.artist,
        album: info.album,
        minutes: Math.round(trackMinutes[key]),
        streams: count,
        uri,
        url: trackId ? `https://open.spotify.com/track/${trackId}` : undefined,
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
        url: `https://open.spotify.com/search/${encodeURIComponent(info.name + " " + info.artist)}`,
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
  };

  return {
    headline,
    topArtists,
    topTracks,
    topAlbums,
    topNArtists,
    artistMinutes,
    temporal,
    behavior,
    streaks,
    discovery,
    extremes,
  };
}

function getLoyaltyTier(yearsPresent, totalYears) {
  const ratio = yearsPresent / totalYears;
  if (yearsPresent >= 6 || ratio >= 0.75) return "ride-or-die";
  if (yearsPresent >= 4 || ratio >= 0.5) return "regular";
  if (yearsPresent >= 2) return "familiar";
  return "new";
}

function computePerYearLoyalty(yearTopArtists, currentYear, currentTopArtists, currentArtistMinutes) {
  // yearTopArtists: { year: [artistNames] } for all prior years
  // Figure out which of this year's top 20 are returning
  const priorYears = Object.keys(yearTopArtists)
    .map(Number)
    .filter((y) => y < currentYear)
    .sort();

  if (priorYears.length === 0) return null;

  const totalYears = priorYears.length + 1; // including current year

  const returning = [];
  const brandNew = [];

  for (const artist of currentTopArtists) {
    const activeYears = priorYears.filter((y) =>
      yearTopArtists[y].includes(artist.name)
    );

    if (activeYears.length > 0) {
      returning.push({
        name: artist.name,
        yearsActive: activeYears.length + 1, // +1 for current year
        totalYears,
        firstYear: activeYears[0],
        currentYearRank: artist.rank,
        currentYearMinutes: artist.minutes,
        tier: getLoyaltyTier(activeYears.length + 1, totalYears),
      });
    } else {
      brandNew.push({
        name: artist.name,
        currentYearRank: artist.rank,
        currentYearMinutes: artist.minutes,
      });
    }
  }

  returning.sort((a, b) => b.yearsActive - a.yearsActive);

  return {
    returning,
    new: brandNew,
    returningCount: returning.length,
    newCount: brandNew.length,
    returningPct: Math.round((returning.length / currentTopArtists.length) * 100),
  };
}

function computeAllTime(allYearData, years) {
  const totalYears = years.length;

  // --- Overview ---
  let totalMinutes = 0;
  let totalStreams = 0;
  const allArtists = new Set();
  const allTracks = new Set();
  const allAlbums = new Set();
  let totalDaysActive = 0;

  const yearByYear = [];

  for (const year of years) {
    const d = allYearData[year];
    totalMinutes += d.headline.totalMinutes;
    totalStreams += d.headline.totalStreams;
    totalDaysActive += d.headline.daysActive;

    yearByYear.push({
      year,
      minutes: d.headline.totalMinutes,
      streams: d.headline.totalStreams,
      uniqueArtists: d.headline.uniqueArtists,
      uniqueTracks: d.headline.uniqueTracks,
      uniqueAlbums: d.headline.uniqueAlbums,
      daysActive: d.headline.daysActive,
      topArtist: d.topArtists[0]?.name,
      topTrack: d.topTracks[0]?.name,
      discoveryRate: d.discovery?.discoveryRate,
    });
  }

  const overview = {
    totalMinutes,
    totalStreams,
    totalYears,
    totalDaysActive,
    firstYear: years[0],
    latestYear: years[years.length - 1],
  };

  // --- All-time top artists ---
  const cumulativeArtistMinutes = {};
  const cumulativeArtistStreams = {};
  const artistYearsPresent = {};
  const artistMinutesByYear = {};
  const artistFirstYear = {};

  for (const year of years) {
    const d = allYearData[year];
    for (const artistName of d.topNArtists) {
      if (!artistYearsPresent[artistName]) artistYearsPresent[artistName] = [];
      artistYearsPresent[artistName].push(year);
    }
    // Use full artist minutes (not just top N) for cumulative stats
    for (const [name, mins] of Object.entries(d.artistMinutes)) {
      cumulativeArtistMinutes[name] = (cumulativeArtistMinutes[name] || 0) + mins;
      if (!artistMinutesByYear[name]) artistMinutesByYear[name] = {};
      artistMinutesByYear[name][year] = Math.round(mins);
      if (!artistFirstYear[name]) artistFirstYear[name] = year;
    }
  }

  const allTimeTopArtists = Object.entries(cumulativeArtistMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, mins], i) => {
      const minutesByYear = artistMinutesByYear[name] || {};
      const peakYear = Object.entries(minutesByYear).sort(
        (a, b) => b[1] - a[1]
      )[0];
      return {
        rank: i + 1,
        name,
        totalMinutes: Math.round(mins),
        firstYear: artistFirstYear[name],
        yearsPresent: artistYearsPresent[name]?.length || 0,
        peakYear: peakYear ? Number(peakYear[0]) : null,
        peakMinutes: peakYear ? peakYear[1] : 0,
        minutesByYear: years.map((y) => minutesByYear[y] || 0),
      };
    });

  // --- All-time top tracks ---
  const cumulativeTrackStreams = {};
  const cumulativeTrackMinutes = {};
  const trackInfoMap = {};

  for (const year of years) {
    const d = allYearData[year];
    for (const t of d.topTracks) {
      const key = `${t.name}|||${t.artist}`;
      cumulativeTrackStreams[key] = (cumulativeTrackStreams[key] || 0) + t.streams;
      cumulativeTrackMinutes[key] = (cumulativeTrackMinutes[key] || 0) + t.minutes;
      if (!trackInfoMap[key]) trackInfoMap[key] = { name: t.name, artist: t.artist, album: t.album };
    }
  }

  const allTimeTopTracks = Object.entries(cumulativeTrackStreams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, streams], i) => ({
      rank: i + 1,
      ...trackInfoMap[key],
      totalStreams: streams,
      totalMinutes: Math.round(cumulativeTrackMinutes[key] || 0),
    }));

  // --- All-time top albums ---
  const cumulativeAlbumMinutes = {};
  const cumulativeAlbumStreams = {};
  const albumInfoMap = {};

  for (const year of years) {
    const d = allYearData[year];
    for (const a of d.topAlbums) {
      const key = `${a.name}|||${a.artist}`;
      cumulativeAlbumMinutes[key] = (cumulativeAlbumMinutes[key] || 0) + a.minutes;
      cumulativeAlbumStreams[key] = (cumulativeAlbumStreams[key] || 0) + a.streams;
      if (!albumInfoMap[key]) albumInfoMap[key] = { name: a.name, artist: a.artist };
    }
  }

  const allTimeTopAlbums = Object.entries(cumulativeAlbumMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, mins], i) => ({
      rank: i + 1,
      ...albumInfoMap[key],
      totalMinutes: Math.round(mins),
      totalStreams: cumulativeAlbumStreams[key],
    }));

  // --- Artist loyalty ---
  const artistLoyalty = Object.entries(artistYearsPresent)
    .filter(([, yrs]) => yrs.length >= 2)
    .map(([name, yrs]) => {
      const minutesByYear = artistMinutesByYear[name] || {};
      const peakYear = Object.entries(minutesByYear).sort(
        (a, b) => b[1] - a[1]
      )[0];
      return {
        name,
        yearsPresent: yrs.length,
        totalYears,
        loyaltyScore: +(yrs.length / totalYears).toFixed(2),
        tier: getLoyaltyTier(yrs.length, totalYears),
        firstYear: yrs[0],
        activeYears: yrs,
        totalMinutes: Math.round(cumulativeArtistMinutes[name] || 0),
        minutesByYear: years.map((y) => minutesByYear[y] || 0),
        peakYear: peakYear ? Number(peakYear[0]) : null,
        peakMinutes: peakYear ? peakYear[1] : 0,
      };
    })
    .sort((a, b) => b.yearsPresent - a.yearsPresent || b.totalMinutes - a.totalMinutes)
    .slice(0, 30);

  // --- Taste turnover ---
  const yearTopSets = {};
  for (const year of years) {
    yearTopSets[year] = new Set(allYearData[year].topNArtists);
  }

  const tasteTurnover = years.map((year, idx) => {
    if (idx === 0) {
      return { year, returningPct: 0, newPct: 100 };
    }
    const current = yearTopSets[year];
    const priorAll = new Set();
    for (let i = 0; i < idx; i++) {
      for (const a of yearTopSets[years[i]]) priorAll.add(a);
    }
    let returningCount = 0;
    for (const a of current) {
      if (priorAll.has(a)) returningCount++;
    }
    const returningPct = Math.round((returningCount / current.size) * 100);
    return { year, returningPct, newPct: 100 - returningPct };
  });

  // --- First discoveries for all-time top artists ---
  const firstDiscoveries = allTimeTopArtists.map((a) => ({
    name: a.name,
    firstYear: a.firstYear,
    totalMinutes: a.totalMinutes,
  }));

  return {
    source: "extended_history",
    lastUpdated: new Date().toISOString(),
    overview,
    yearByYear,
    allTimeTopArtists,
    allTimeTopTracks,
    allTimeTopAlbums,
    artistLoyalty,
    tasteTurnover,
    firstDiscoveries,
    years,
  };
}

function main() {
  if (!existsSync(RAW_DIR)) {
    console.error(`Raw data directory not found: ${RAW_DIR}`);
    console.error(
      "Place your Spotify Extended Streaming History files there."
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
  const allYearData = {};
  const yearTopArtistNames = {}; // { year: [top N artist names] }

  // First pass: compute per-year stats
  for (const year of years) {
    const yearStreams = yearGroups[year];
    console.log(`\nProcessing ${year}: ${yearStreams.length} streams`);

    const stats = computeYearStats(
      yearStreams,
      allPriorArtists,
      allPriorTracks
    );

    allYearData[year] = stats;
    yearTopArtistNames[year] = stats.topNArtists;

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

  // Second pass: compute per-year loyalty and write files
  for (const year of years) {
    const stats = allYearData[year];

    const loyalty = computePerYearLoyalty(
      yearTopArtistNames,
      year,
      stats.topArtists,
      stats.artistMinutes
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

    // Remove internal-only fields before writing
    const { topNArtists, artistMinutes, ...publicStats } = stats;

    const yearData = {
      year,
      source: "extended_history",
      lastUpdated: new Date().toISOString(),
      ...publicStats,
      ...(loyalty ? { loyalty } : {}),
      ...(apiSnapshot ? { apiSnapshot } : {}),
    };

    writeFileSync(
      resolve(OUTPUT_DIR, `${year}.json`),
      JSON.stringify(yearData, null, 2) + "\n"
    );
    console.log(
      `  Written ${year}.json — ${stats.headline.totalMinutes} min, ${stats.headline.totalStreams} streams, ${stats.headline.uniqueArtists} artists` +
        (loyalty ? `, ${loyalty.returningCount} returning artists` : "")
    );
  }

  // Generate all-time data
  console.log("\nGenerating all-time data...");
  const allTime = computeAllTime(allYearData, years);
  writeFileSync(
    resolve(OUTPUT_DIR, "all-time.json"),
    JSON.stringify(allTime, null, 2) + "\n"
  );
  console.log(
    `  Written all-time.json — ${allTime.overview.totalMinutes} total min, ${allTime.overview.totalYears} years, ${allTime.artistLoyalty.length} loyal artists`
  );

  console.log(
    "\nDone! Run `node scripts/build-wrapped-index.mjs` to update the manifest."
  );
}

main();
