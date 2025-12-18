/**
 * Web Worker for parsing Rekordbox XML files
 * Runs parsing in background to keep UI responsive
 */

import { parseRekordboxXml } from '../lib/parser';
import { validateLibrary } from '../lib/schemas';
import { PROGRESS_STAGES } from '../lib/constants';

/**
 * Message types for worker communication
 */
export interface ParseFileMessage {
  type: 'PARSE_FILE';
  file: File;
}

export interface ProgressMessage {
  type: 'PARSE_PROGRESS';
  percent: number;
  message: string;
}

export interface SuccessMessage {
  type: 'PARSE_SUCCESS';
  library: any; // Will be validated Library type
}

export interface ErrorMessage {
  type: 'PARSE_ERROR';
  error: string;
}

type WorkerMessage = ParseFileMessage;
type WorkerResponse = ProgressMessage | SuccessMessage | ErrorMessage;

/**
 * Post progress update to main thread
 */
function postProgress(percent: number, message: string) {
  const progressMessage: ProgressMessage = {
    type: 'PARSE_PROGRESS',
    percent,
    message,
  };
  self.postMessage(progressMessage);
}

/**
 * Post success message to main thread
 */
function postSuccess(library: any) {
  const successMessage: SuccessMessage = {
    type: 'PARSE_SUCCESS',
    library,
  };
  self.postMessage(successMessage);
}

/**
 * Post error message to main thread
 */
function postError(error: string) {
  const errorMessage: ErrorMessage = {
    type: 'PARSE_ERROR',
    error,
  };
  self.postMessage(errorMessage);
}

/**
 * Main worker message handler
 */
self.addEventListener('message', async (e: MessageEvent<WorkerMessage>) => {
  const { type, file } = e.data;

  if (type !== 'PARSE_FILE') {
    postError('Unknown message type');
    return;
  }

  try {
    // Stage 1: Read file
    postProgress(
      PROGRESS_STAGES.FILE_READ.percent,
      PROGRESS_STAGES.FILE_READ.message
    );

    const text = await file.text();
    const fileName = file.name;
    const fileSize = file.size;

    // Stage 2: Parse XML
    postProgress(
      PROGRESS_STAGES.XML_PARSED.percent,
      PROGRESS_STAGES.XML_PARSED.message
    );

    const library = parseRekordboxXml(text, fileName, fileSize);

    // Stage 3: Validate with Zod
    postProgress(
      PROGRESS_STAGES.TRACKS_PARSED.percent,
      PROGRESS_STAGES.TRACKS_PARSED.message
    );

    const validatedLibrary = validateLibrary(library);

    // Stage 4: Complete
    postProgress(
      PROGRESS_STAGES.VALIDATION_COMPLETE.percent,
      PROGRESS_STAGES.VALIDATION_COMPLETE.message
    );

    // Send result
    postSuccess(validatedLibrary);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown parsing error';
    postError(errorMessage);
  }
});

// Export empty object to make this a module
export {};
