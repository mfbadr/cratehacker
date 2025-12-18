/**
 * Analytics computation functions
 * Computes statistics and distributions from library data
 */

import type {
  Library,
  LibraryStats,
  Track,
  GenreDistribution,
  BpmDistribution,
  KeyDistribution,
  RatingDistribution,
  LibraryGrowth,
} from '@/types/library';
import { BPM_BUCKET_SIZE } from './constants';
import { getPlaylistsByType } from './playlist-parser';

/**
 * Compute all analytics from library
 *
 * @param library - Complete library object
 * @returns Computed statistics
 */
export function computeAnalytics(library: Library): LibraryStats {
  const { tracks, playlists } = library;

  return {
    totalTracks: tracks.length,
    totalArtists: computeTotalArtists(tracks),
    totalGenres: computeTotalGenres(tracks),
    totalPlaylists: getPlaylistsByType(playlists, 'playlist').length,
    averageBpm: computeAverageBpm(tracks),
    totalDuration: computeTotalDuration(tracks),
    genreDistribution: computeGenreDistribution(tracks),
    bpmDistribution: computeBpmDistribution(tracks, BPM_BUCKET_SIZE),
    keyDistribution: computeKeyDistribution(tracks),
    ratingDistribution: computeRatingDistribution(tracks),
    libraryGrowth: computeLibraryGrowth(tracks),
  };
}

/**
 * Count unique artists
 */
function computeTotalArtists(tracks: Track[]): number {
  const artists = new Set<string>();
  for (const track of tracks) {
    if (track.artist && track.artist !== 'Unknown') {
      artists.add(track.artist.toLowerCase());
    }
  }
  return artists.size;
}

/**
 * Count unique genres
 */
function computeTotalGenres(tracks: Track[]): number {
  const genres = new Set<string>();
  for (const track of tracks) {
    if (track.genre) {
      track.genre.forEach((g) => genres.add(g));
    }
  }
  return genres.size;
}

/**
 * Compute average BPM across all tracks with BPM data
 */
function computeAverageBpm(tracks: Track[]): number {
  const tracksWithBpm = tracks.filter((t) => t.bpm !== undefined);
  if (tracksWithBpm.length === 0) return 0;

  const sum = tracksWithBpm.reduce((acc, t) => acc + (t.bpm || 0), 0);
  return Math.round(sum / tracksWithBpm.length);
}

/**
 * Compute total duration in hours
 */
function computeTotalDuration(tracks: Track[]): number {
  const totalSeconds = tracks.reduce((acc, t) => acc + t.duration, 0);
  return totalSeconds / 3600; // Convert to hours
}

/**
 * Compute genre distribution
 * Counts each genre occurrence (tracks with multiple genres count for each)
 */
export function computeGenreDistribution(tracks: Track[]): GenreDistribution[] {
  const genreMap = new Map<string, number>();

  for (const track of tracks) {
    if (track.genre) {
      for (const genre of track.genre) {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      }
    }
  }

  return Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Compute BPM distribution in buckets
 *
 * @param tracks - Array of tracks
 * @param bucketSize - Size of each bucket (default 10)
 * @returns Array of BPM buckets with counts
 */
export function computeBpmDistribution(
  tracks: Track[],
  bucketSize: number = 10
): BpmDistribution[] {
  const buckets = new Map<number, number>();

  for (const track of tracks) {
    if (track.bpm) {
      const bucketStart = Math.floor(track.bpm / bucketSize) * bucketSize;
      buckets.set(bucketStart, (buckets.get(bucketStart) || 0) + 1);
    }
  }

  return Array.from(buckets.entries())
    .map(([rangeStart, count]) => ({
      range: `${rangeStart}-${rangeStart + bucketSize}`,
      count,
      rangeStart,
    }))
    .sort((a, b) => a.rangeStart - b.rangeStart); // Sort by BPM ascending
}

/**
 * Compute key distribution (Camelot wheel)
 */
export function computeKeyDistribution(tracks: Track[]): KeyDistribution[] {
  const keyMap = new Map<string, number>();

  for (const track of tracks) {
    if (track.key) {
      keyMap.set(track.key, (keyMap.get(track.key) || 0) + 1);
    }
  }

  return Array.from(keyMap.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Compute rating distribution
 */
export function computeRatingDistribution(tracks: Track[]): RatingDistribution[] {
  const ratingMap = new Map<number, number>();

  for (const track of tracks) {
    const rating = track.rating || 0;
    ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
  }

  return Array.from(ratingMap.entries())
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating); // Sort by rating ascending
}

/**
 * Compute library growth over time (by month)
 */
export function computeLibraryGrowth(tracks: Track[]): LibraryGrowth[] {
  // Group tracks by month
  const monthMap = new Map<string, { count: number; date: Date }>();

  for (const track of tracks) {
    const date = track.dateAdded;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (monthMap.has(monthKey)) {
      monthMap.get(monthKey)!.count++;
    } else {
      monthMap.set(monthKey, {
        count: 1,
        date: new Date(date.getFullYear(), date.getMonth(), 1),
      });
    }
  }

  // Convert to array and sort by date
  const growthArray = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      count: data.count,
      date: data.date,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Convert to cumulative count
  let cumulative = 0;
  return growthArray.map((item) => {
    cumulative += item.count;
    return {
      month: item.month,
      count: cumulative,
      date: item.date,
    };
  });
}

/**
 * Get tracks with missing metadata
 */
export function getTracksWithMissingMetadata(library: Library) {
  const { tracks } = library;

  return {
    missingGenre: tracks.filter((t) => !t.genre || t.genre.length === 0),
    missingBpm: tracks.filter((t) => !t.bpm),
    missingKey: tracks.filter((t) => !t.key),
    missingYear: tracks.filter((t) => !t.year),
    missingAlbum: tracks.filter((t) => !t.album),
  };
}

/**
 * Get top tracks by play count
 */
export function getTopTracks(tracks: Track[], limit: number = 10): Track[] {
  return tracks
    .filter((t) => t.playCount && t.playCount > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, limit);
}

/**
 * Get top artists by track count
 */
export function getTopArtists(tracks: Track[], limit: number = 10) {
  const artistMap = new Map<string, number>();

  for (const track of tracks) {
    if (track.artist && track.artist !== 'Unknown') {
      const artist = track.artist;
      artistMap.set(artist, (artistMap.get(artist) || 0) + 1);
    }
  }

  return Array.from(artistMap.entries())
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Detect duplicate tracks (same artist and title)
 * Returns groups of tracks that appear to be duplicates
 */
export function findDuplicateTracks(tracks: Track[]): Track[][] {
  // Group tracks by normalized artist + title
  const trackGroups = new Map<string, Track[]>();

  for (const track of tracks) {
    // Skip tracks with unknown/missing artist or title
    if (
      !track.artist ||
      !track.title ||
      track.artist === 'Unknown' ||
      track.title === 'Unknown'
    ) {
      continue;
    }

    // Create normalized key for comparison
    const key = `${track.artist.toLowerCase().trim()}|||${track.title.toLowerCase().trim()}`;

    if (!trackGroups.has(key)) {
      trackGroups.set(key, []);
    }
    trackGroups.get(key)!.push(track);
  }

  // Filter to only groups with 2+ tracks (duplicates)
  const duplicateGroups = Array.from(trackGroups.values()).filter(
    (group) => group.length > 1
  );

  // Sort groups by number of duplicates (most duplicates first)
  return duplicateGroups.sort((a, b) => b.length - a.length);
}
