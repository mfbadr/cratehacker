/**
 * Main Rekordbox XML parser
 * Converts Rekordbox XML export to Library format
 */

import { XMLParser } from 'fast-xml-parser';
import type { Track, Library, LibraryMetadata } from '@/types/library';
import { parseGenres } from './genre-utils';
import { parsePlaylists } from './playlist-parser';

/**
 * fast-xml-parser configuration for Rekordbox XML
 */
const parserOptions = {
  ignoreAttributes: false, // Track data is in attributes
  attributeNamePrefix: '', // No prefix for attributes
  parseAttributeValue: false, // Manual parsing for better control
  parseTagValue: true,
  trimValues: true,
  ignoreDeclaration: true,
  // Ensure TRACK and NODE are always arrays
  isArray: (tagName: string) => tagName === 'TRACK' || tagName === 'NODE',
};

/**
 * Raw XML track structure
 */
interface XmlTrack {
  TrackID: string | number;
  Name?: string;
  Artist?: string;
  Album?: string;
  Genre?: string;
  AverageBpm?: string | number;
  TotalTime?: string | number;
  DateAdded?: string;
  Tonality?: string;
  PlayCount?: string | number;
  Rating?: string | number;
  Location?: string;
  TrackNumber?: string | number;
  Year?: string | number;
  Comments?: string;
  BitRate?: string | number;
  SampleRate?: string | number;
  Label?: string;
  Remixer?: string;
  Composer?: string;
  Grouping?: string;
}

/**
 * Parse a single track from XML
 */
function parseTrack(xmlTrack: XmlTrack): Track {
  const genres = parseGenres(xmlTrack.Genre);

  // Parse BPM - handle invalid values
  const bpmVal = xmlTrack.AverageBpm ? parseFloat(String(xmlTrack.AverageBpm)) : undefined;
  const bpm = bpmVal && !isNaN(bpmVal) && bpmVal > 0 ? bpmVal : undefined;

  // Parse duration - handle invalid values
  const durationVal = xmlTrack.TotalTime ? parseInt(String(xmlTrack.TotalTime)) : 0;
  const duration = durationVal >= 0 ? durationVal : 0;

  // Parse date - handle both YYYY-MM-DD and ISO formats
  let dateAdded: Date;
  try {
    dateAdded = xmlTrack.DateAdded ? new Date(xmlTrack.DateAdded) : new Date();
    // Validate date
    if (isNaN(dateAdded.getTime())) {
      dateAdded = new Date();
    }
  } catch {
    dateAdded = new Date();
  }

  // Parse year - handle invalid values
  const yearVal = xmlTrack.Year ? parseInt(String(xmlTrack.Year)) : undefined;
  const year = yearVal && yearVal >= 1900 && yearVal <= 2100 ? yearVal : undefined;

  // Parse rating - handle invalid values
  const ratingVal = xmlTrack.Rating ? parseInt(String(xmlTrack.Rating)) : undefined;
  const rating = ratingVal !== undefined && ratingVal >= 0 && ratingVal <= 5 ? ratingVal : undefined;

  return {
    id: String(xmlTrack.TrackID),
    title: xmlTrack.Name || 'Unknown',
    artist: xmlTrack.Artist || 'Unknown',
    album: xmlTrack.Album || undefined,
    genre: genres,
    bpm,
    key: xmlTrack.Tonality || undefined,
    rating,
    playCount: xmlTrack.PlayCount ? parseInt(String(xmlTrack.PlayCount)) : undefined,
    duration,
    dateAdded,
    location: xmlTrack.Location || '',
    trackNumber: xmlTrack.TrackNumber
      ? parseInt(String(xmlTrack.TrackNumber))
      : undefined,
    year,
    comments: xmlTrack.Comments || undefined,
    tonality: xmlTrack.Tonality || undefined,
    bitRate: xmlTrack.BitRate ? parseInt(String(xmlTrack.BitRate)) : undefined,
    sampleRate: xmlTrack.SampleRate
      ? parseInt(String(xmlTrack.SampleRate))
      : undefined,
    label: xmlTrack.Label || undefined,
    remixer: xmlTrack.Remixer || undefined,
    composer: xmlTrack.Composer || undefined,
    grouping: xmlTrack.Grouping || undefined,
  };
}

/**
 * Parse tracks from COLLECTION section
 */
function parseTracks(collectionNode: any): Track[] {
  if (!collectionNode || !collectionNode.TRACK) {
    return [];
  }

  const trackNodes = Array.isArray(collectionNode.TRACK)
    ? collectionNode.TRACK
    : [collectionNode.TRACK];

  return trackNodes.map(parseTrack);
}

/**
 * Extract metadata from XML
 */
function extractMetadata(xmlRoot: any, fileName?: string, fileSize?: number): LibraryMetadata {
  const product = xmlRoot.PRODUCT || {};

  return {
    version: product.Version || 'Unknown',
    company: product.Company || 'Unknown',
    totalTracks: xmlRoot.COLLECTION?.Entries
      ? parseInt(String(xmlRoot.COLLECTION.Entries))
      : 0,
    parsedAt: new Date(),
    fileName,
    fileSize,
  };
}

/**
 * Parse Rekordbox XML string into Library object
 *
 * @param xmlString - Raw XML content
 * @param fileName - Optional filename for metadata
 * @param fileSize - Optional file size for metadata
 * @returns Parsed library object
 * @throws Error if XML is malformed or missing required structure
 */
export function parseRekordboxXml(
  xmlString: string,
  fileName?: string,
  fileSize?: number
): Library {
  const parser = new XMLParser(parserOptions);

  // Parse XML
  let xmlResult: any;
  try {
    xmlResult = parser.parse(xmlString);
  } catch (error) {
    throw new Error(
      `Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Validate structure
  if (!xmlResult.DJ_PLAYLISTS) {
    throw new Error('Invalid Rekordbox XML: Missing DJ_PLAYLISTS root element');
  }

  const root = xmlResult.DJ_PLAYLISTS;

  if (!root.COLLECTION) {
    throw new Error('Invalid Rekordbox XML: Missing COLLECTION element');
  }

  // Parse tracks
  const tracks = parseTracks(root.COLLECTION);

  // Parse playlists
  const playlists = root.PLAYLISTS ? parsePlaylists(root.PLAYLISTS) : [];

  // Extract metadata
  const metadata = extractMetadata(root, fileName, fileSize);

  return {
    tracks,
    playlists,
    metadata,
  };
}

/**
 * Validate Rekordbox XML structure (lightweight check)
 *
 * @param xmlString - Raw XML content
 * @returns True if valid structure, false otherwise
 */
export function isValidRekordboxXml(xmlString: string): boolean {
  try {
    const parser = new XMLParser(parserOptions);
    const xmlResult = parser.parse(xmlString);

    return !!(
      xmlResult.DJ_PLAYLISTS &&
      xmlResult.DJ_PLAYLISTS.COLLECTION &&
      xmlResult.DJ_PLAYLISTS.PRODUCT
    );
  } catch {
    return false;
  }
}
