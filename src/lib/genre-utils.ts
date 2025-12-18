/**
 * Genre parsing utilities
 * Handles multi-genre strings from Rekordbox (e.g., "Electro; Techno/House; Dance")
 */

/**
 * Parse multi-genre string into array of genre names
 *
 * @param genreString - Raw genre string from Rekordbox XML
 * @returns Array of genre names, or undefined if no valid genres
 *
 * @example
 * parseGenres("Electro; Techno/House; Dance")
 * // Returns: ["Electro", "Techno/House", "Dance"]
 *
 * @example
 * parseGenres("")
 * // Returns: undefined
 */
export function parseGenres(genreString: string | undefined | null): string[] | undefined {
  if (!genreString || genreString.trim() === '') {
    return undefined;
  }

  const genres = genreString
    .split(';')
    .map((genre) => genre.trim())
    .filter((genre) => genre.length > 0);

  return genres.length > 0 ? genres : undefined;
}

/**
 * Get the primary genre (first genre in the list)
 *
 * @param genres - Array of genre names
 * @returns Primary genre name, or undefined if no genres
 */
export function getPrimaryGenre(genres: string[] | undefined): string | undefined {
  return genres?.[0];
}

/**
 * Join genres back into a display string
 *
 * @param genres - Array of genre names
 * @returns Comma-separated genre string
 *
 * @example
 * joinGenres(["Electro", "Dance"])
 * // Returns: "Electro, Dance"
 */
export function joinGenres(genres: string[] | undefined): string {
  if (!genres || genres.length === 0) {
    return 'N/A';
  }
  return genres.join(', ');
}

/**
 * Check if a track has a specific genre
 *
 * @param trackGenres - Array of genre names from track
 * @param genreToCheck - Genre to check for
 * @returns True if the track has the genre
 */
export function hasGenre(trackGenres: string[] | undefined, genreToCheck: string): boolean {
  if (!trackGenres) {
    return false;
  }
  return trackGenres.some((genre) => genre.toLowerCase() === genreToCheck.toLowerCase());
}

/**
 * Get all unique genres from a list of tracks
 *
 * @param tracks - Array of tracks
 * @returns Set of unique genre names
 */
export function getAllUniqueGenres(tracks: Array<{ genre?: string[] }>): Set<string> {
  const genres = new Set<string>();

  for (const track of tracks) {
    if (track.genre) {
      track.genre.forEach((genre) => genres.add(genre));
    }
  }

  return genres;
}
