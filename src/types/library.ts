/**
 * Core data models for DJ Library Analyzer
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string[]; // Array for multi-genre support
  bpm?: number;
  key?: string; // Camelot notation (e.g., "1A", "5B")
  rating?: number; // 0-5
  playCount?: number;
  duration: number; // in seconds
  dateAdded: Date;
  location: string; // file path
  trackNumber?: number;
  year?: number;
  comments?: string;
  tonality?: string; // Same as key, Rekordbox notation
  bitRate?: number;
  sampleRate?: number;
  label?: string;
  remixer?: string;
  composer?: string;
  grouping?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: string[]; // track IDs
  parentId?: string; // for nested playlists
  type: 'folder' | 'playlist';
  count?: number; // number of children (for folders) or tracks (for playlists)
}

export interface LibraryMetadata {
  version: string; // Rekordbox version
  company: string; // "AlphaTheta"
  totalTracks: number;
  parsedAt: Date;
  fileName?: string;
  fileSize?: number;
}

export interface Library {
  tracks: Track[];
  playlists: Playlist[];
  metadata: LibraryMetadata;
}

export interface LibraryStats {
  totalTracks: number;
  totalArtists: number;
  totalGenres: number;
  totalPlaylists: number;
  averageBpm: number;
  totalDuration: number; // in hours
  genreDistribution: GenreDistribution[];
  bpmDistribution: BpmDistribution[];
  keyDistribution: KeyDistribution[];
  ratingDistribution: RatingDistribution[];
  libraryGrowth: LibraryGrowth[];
}

export interface GenreDistribution {
  genre: string;
  count: number;
}

export interface BpmDistribution {
  range: string; // e.g., "120-130"
  count: number;
  rangeStart: number; // for sorting
}

export interface KeyDistribution {
  key: string;
  count: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface LibraryGrowth {
  month: string; // e.g., "2023-01"
  count: number;
  date: Date; // for sorting
}
