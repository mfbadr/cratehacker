/**
 * Playlist parsing utilities for Rekordbox XML
 * Handles recursive NODE structure (Type 0 = folder, Type 1 = playlist)
 */

import type { Playlist } from '@/types/library';
import { randomUUID } from 'crypto';

/**
 * Raw XML node structure
 */
interface XmlNode {
  Name: string;
  Type: string | number;
  Count?: number;
  Entries?: number;
  KeyType?: string | number;
  NODE?: XmlNode | XmlNode[];
  TRACK?: XmlTrack | XmlTrack[];
}

interface XmlTrack {
  Key: string | number;
}

/**
 * Generate a unique ID for playlists
 * In browser environment, use crypto.randomUUID()
 * In Node/Worker, fallback to timestamp + random
 */
function generateId(): string {
  try {
    // Try to use browser crypto API
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {
    // Fallback
  }

  // Fallback: timestamp + random number
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Parse playlists from Rekordbox XML PLAYLISTS section
 *
 * @param playlistsNode - The PLAYLISTS root node from XML
 * @returns Array of parsed playlists (both folders and playlists)
 */
export function parsePlaylists(playlistsNode: any): Playlist[] {
  const playlists: Playlist[] = [];

  if (!playlistsNode || !playlistsNode.NODE) {
    return playlists;
  }

  // The root NODE is typically "ROOT" with Type="0"
  const rootNode = Array.isArray(playlistsNode.NODE)
    ? playlistsNode.NODE[0]
    : playlistsNode.NODE;

  if (!rootNode) {
    return playlists;
  }

  // Parse children of ROOT node
  const parsed = parseNodeRecursive(rootNode, undefined);
  return parsed;
}

/**
 * Recursively parse a NODE and its children
 *
 * @param node - Current XML node
 * @param parentId - ID of parent playlist/folder
 * @returns Array of parsed playlists
 */
function parseNodeRecursive(node: XmlNode, parentId: string | undefined): Playlist[] {
  const playlists: Playlist[] = [];

  // Parse children NODEs if they exist
  if (node.NODE) {
    const childNodes = Array.isArray(node.NODE) ? node.NODE : [node.NODE];

    for (const childNode of childNodes) {
      const id = generateId();
      const type = String(childNode.Type) === '0' ? 'folder' : 'playlist';

      const playlist: Playlist = {
        id,
        name: childNode.Name || 'Unnamed',
        type,
        parentId,
        tracks: [],
        count: childNode.Count || childNode.Entries || 0,
      };

      // Extract track IDs if it's a playlist
      if (type === 'playlist' && childNode.TRACK) {
        const trackNodes = Array.isArray(childNode.TRACK)
          ? childNode.TRACK
          : [childNode.TRACK];
        playlist.tracks = trackNodes.map((t) => String(t.Key));
      }

      playlists.push(playlist);

      // Recursively parse children
      if (childNode.NODE) {
        const children = parseNodeRecursive(childNode, id);
        playlists.push(...children);
      }
    }
  }

  return playlists;
}

/**
 * Get all playlists of a specific type
 *
 * @param playlists - Array of playlists
 * @param type - Type to filter by
 * @returns Filtered array of playlists
 */
export function getPlaylistsByType(
  playlists: Playlist[],
  type: 'folder' | 'playlist'
): Playlist[] {
  return playlists.filter((p) => p.type === type);
}

/**
 * Get children of a specific playlist/folder
 *
 * @param playlists - Array of all playlists
 * @param parentId - ID of parent to get children for
 * @returns Array of child playlists
 */
export function getPlaylistChildren(playlists: Playlist[], parentId: string): Playlist[] {
  return playlists.filter((p) => p.parentId === parentId);
}

/**
 * Get playlist hierarchy depth
 *
 * @param playlist - Playlist to check
 * @param allPlaylists - All playlists in library
 * @returns Depth level (0 = root level)
 */
export function getPlaylistDepth(playlist: Playlist, allPlaylists: Playlist[]): number {
  let depth = 0;
  let currentId = playlist.parentId;

  while (currentId) {
    depth++;
    const parent = allPlaylists.find((p) => p.id === currentId);
    currentId = parent?.parentId;
  }

  return depth;
}
