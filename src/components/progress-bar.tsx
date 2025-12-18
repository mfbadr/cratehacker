'use client';

/**
 * Animated progress bar component for file parsing
 */

import { Card } from '@/components/ui/card';

interface ProgressBarProps {
  percent: number;
  message: string;
  fileName?: string;
}

export function ProgressBar({ percent, message, fileName }: ProgressBarProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      <div className="space-y-4">
        {fileName && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Parsing</p>
            <p className="font-medium truncate">{fileName}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{message}</span>
            <span className="text-sm text-muted-foreground">{percent}%</span>
          </div>

          <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Please wait while we analyze your library...
        </p>
      </div>
    </Card>
  );
}
