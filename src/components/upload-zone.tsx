'use client';

/**
 * Drag-and-drop file upload component
 */

import { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MAX_FILE_SIZE, formatFileSize } from '@/lib/constants';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);

    // Check file type
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setError('Please upload a valid XML file');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size: ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }

    return true;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [disabled, validateFile, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }

      // Reset input
      e.target.value = '';
    },
    [validateFile, onFileSelect]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card
        className={`
          relative p-12 border-2 border-dashed transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          accept=".xml"
          onChange={handleFileInput}
          disabled={disabled}
        />

        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center gap-4 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <svg
            className="w-16 h-16 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              {isDragging ? 'Drop your file here' : 'Drag and drop your Rekordbox XML file'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive font-medium">
              {error}
            </div>
          )}
        </label>
      </Card>

      <div className="mt-6 text-sm text-muted-foreground space-y-2">
        <p className="font-medium">How to export your Rekordbox library:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Open Rekordbox</li>
          <li>Go to File → Export Collection in xml format</li>
          <li>Save the XML file to your computer</li>
          <li>Upload it here to analyze your library</li>
        </ol>
      </div>
    </div>
  );
}
