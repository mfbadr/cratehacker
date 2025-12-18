/**
 * Application constants
 */

/**
 * BPM bucket size for histogram grouping
 * Example: 120-130, 130-140, etc.
 */
export const BPM_BUCKET_SIZE = 10;

/**
 * Maximum file size for upload (100MB)
 */
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

/**
 * IndexedDB key for storing library data
 */
export const LIBRARY_STORAGE_KEY = 'dj-library';

/**
 * Accepted file types for upload
 */
export const ACCEPTED_FILE_TYPES = {
  'text/xml': ['.xml'],
  'application/xml': ['.xml'],
};

/**
 * Parsing progress stages
 */
export const PROGRESS_STAGES = {
  FILE_READ: { percent: 10, message: 'Reading file...' },
  XML_PARSED: { percent: 40, message: 'Parsing XML...' },
  TRACKS_PARSED: { percent: 70, message: 'Processing tracks...' },
  PLAYLISTS_PARSED: { percent: 90, message: 'Processing playlists...' },
  VALIDATION_COMPLETE: { percent: 100, message: 'Complete!' },
} as const;

/**
 * Camelot wheel key mappings
 */
export const CAMELOT_KEYS = [
  '1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A',
  '1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B',
] as const;

/**
 * Format duration from seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
