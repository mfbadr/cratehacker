/**
 * Zod validation schemas for runtime type checking
 */

import { z } from 'zod';

/**
 * Transform empty strings to undefined
 */
const emptyStringToUndefined = z
  .string()
  .optional()
  .transform((val) => (val === '' || val === undefined ? undefined : val));

/**
 * Transform date strings to Date objects
 */
const dateSchema = z.union([
  z.string().transform((val) => new Date(val)),
  z.date(),
]);

/**
 * Track schema with validation and transformations
 */
export const trackSchema = z.object({
  id: z.string(),
  title: z.string().default('Unknown'),
  artist: z.string().default('Unknown'),
  album: emptyStringToUndefined,
  genre: z.array(z.string()).optional(),
  bpm: z.number().positive().optional(),
  key: emptyStringToUndefined,
  rating: z.number().int().min(0).max(5).optional(),
  playCount: z.number().int().min(0).optional(),
  duration: z.number().min(0),
  dateAdded: dateSchema,
  location: z.string(),
  trackNumber: z.number().int().optional().transform((val) => {
    // Convert 0 or negative to undefined
    if (val === undefined || val <= 0) return undefined;
    return val;
  }),
  year: z.number().int().optional().transform((val) => {
    // Convert invalid years (0, negative, too old) to undefined
    if (val === undefined || val < 1900 || val > 2100) return undefined;
    return val;
  }),
  comments: emptyStringToUndefined,
  tonality: emptyStringToUndefined,
  bitRate: z.number().optional().transform((val) => {
    // Convert 0 or negative to undefined
    if (val === undefined || val <= 0) return undefined;
    return val;
  }),
  sampleRate: z.number().positive().optional(),
  label: emptyStringToUndefined,
  remixer: emptyStringToUndefined,
  composer: emptyStringToUndefined,
  grouping: emptyStringToUndefined,
});

/**
 * Playlist schema
 */
export const playlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  tracks: z.array(z.string()),
  parentId: z.string().optional(),
  type: z.enum(['folder', 'playlist']),
  count: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (val === undefined) return undefined;
      const num = typeof val === 'string' ? parseInt(val) : val;
      return !isNaN(num) && num >= 0 ? num : undefined;
    })
    .optional(),
});

/**
 * Library metadata schema
 */
export const metadataSchema = z.object({
  version: z.string(),
  company: z.string(),
  totalTracks: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val) : val;
      return !isNaN(num) && num >= 0 ? num : 0;
    }),
  parsedAt: dateSchema,
  fileName: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
});

/**
 * Complete library schema
 */
export const librarySchema = z.object({
  tracks: z.array(trackSchema),
  playlists: z.array(playlistSchema),
  metadata: metadataSchema,
});

/**
 * Type inference from schemas
 */
export type TrackInput = z.input<typeof trackSchema>;
export type PlaylistInput = z.input<typeof playlistSchema>;
export type LibraryInput = z.input<typeof librarySchema>;

/**
 * Validate and transform library data
 */
export function validateLibrary(data: unknown) {
  return librarySchema.parse(data);
}

/**
 * Safe validation that returns success/error result
 */
export function safeValidateLibrary(data: unknown) {
  return librarySchema.safeParse(data);
}
