/**
 * IndexedDB storage utilities
 * Uses idb-keyval for simple key-value storage
 */

import { get, set, del } from 'idb-keyval';
import type { Library } from '@/types/library';
import { LIBRARY_STORAGE_KEY } from './constants';

/**
 * Save library to IndexedDB
 *
 * @param library - Library object to save
 * @throws Error if storage fails
 */
export async function saveLibrary(library: Library): Promise<void> {
  try {
    await set(LIBRARY_STORAGE_KEY, library);
  } catch (error) {
    throw new Error(
      `Failed to save library: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get library from IndexedDB
 *
 * @returns Library object if found, null otherwise
 * @throws Error if retrieval fails
 */
export async function getLibrary(): Promise<Library | null> {
  try {
    const library = await get<Library>(LIBRARY_STORAGE_KEY);
    return library || null;
  } catch (error) {
    throw new Error(
      `Failed to retrieve library: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete library from IndexedDB
 *
 * @throws Error if deletion fails
 */
export async function clearLibrary(): Promise<void> {
  try {
    await del(LIBRARY_STORAGE_KEY);
  } catch (error) {
    throw new Error(
      `Failed to clear library: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if library exists in IndexedDB
 *
 * @returns True if library exists, false otherwise
 */
export async function hasLibrary(): Promise<boolean> {
  try {
    const library = await get<Library>(LIBRARY_STORAGE_KEY);
    return library !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get library metadata without loading full library
 * Useful for displaying file info without loading all tracks
 *
 * @returns Library metadata if library exists, null otherwise
 */
export async function getLibraryMetadata() {
  try {
    const library = await get<Library>(LIBRARY_STORAGE_KEY);
    return library?.metadata || null;
  } catch {
    return null;
  }
}
