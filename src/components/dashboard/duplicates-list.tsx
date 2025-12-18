'use client';

/**
 * Duplicate tracks list component
 * Shows groups of tracks with matching artist and title
 */

import { useState } from 'react';
import { Track } from '@/types/library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, AlertCircle, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DuplicatesListProps {
  duplicateGroups: Track[][];
}

export function DuplicatesList({ duplicateGroups }: DuplicatesListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (index: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGroups(newExpanded);
  };

  const expandAll = () => {
    setExpandedGroups(new Set(duplicateGroups.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };
  if (duplicateGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Duplicate Tracks
          </CardTitle>
          <CardDescription>
            No duplicates found! Your library is clean.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalDuplicates = duplicateGroups.reduce(
    (sum, group) => sum + group.length,
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Duplicate Tracks
            </CardTitle>
            <CardDescription>
              Found {duplicateGroups.length} duplicate track groups ({totalDuplicates}{' '}
              total tracks)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {duplicateGroups.map((group, groupIndex) => {
            const isExpanded = expandedGroups.has(groupIndex);
            return (
              <div key={groupIndex} className="border-l-4 border-yellow-500 pl-4">
                <button
                  onClick={() => toggleGroup(groupIndex)}
                  className="w-full text-left hover:bg-muted/50 rounded-md p-2 -ml-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        <h3 className="font-semibold text-lg truncate">{group[0].title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{group[0].artist}</p>
                    </div>
                    <p className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-950 px-2 py-1 rounded">
                      {group.length} copies
                    </p>
                  </div>
                </button>
                {isExpanded && (
                  <div className="space-y-2 mt-3">
                    {group.map((track, trackIndex) => (
                      <div
                        key={track.id}
                        className="bg-muted/50 rounded-md p-3 text-sm space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span className="font-mono truncate" title={track.location}>
                                {track.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          {track.album && (
                            <div>
                              <span className="text-muted-foreground">Album:</span>{' '}
                              <span className="font-medium">{track.album}</span>
                            </div>
                          )}
                          {track.year && (
                            <div>
                              <span className="text-muted-foreground">Year:</span>{' '}
                              <span className="font-medium">{track.year}</span>
                            </div>
                          )}
                          {track.bpm && (
                            <div>
                              <span className="text-muted-foreground">BPM:</span>{' '}
                              <span className="font-medium">{track.bpm}</span>
                            </div>
                          )}
                          {track.key && (
                            <div>
                              <span className="text-muted-foreground">Key:</span>{' '}
                              <span className="font-medium">{track.key}</span>
                            </div>
                          )}
                          {track.bitRate && (
                            <div>
                              <span className="text-muted-foreground">Bitrate:</span>{' '}
                              <span className="font-medium">{track.bitRate} kbps</span>
                            </div>
                          )}
                          {track.duration && (
                            <div>
                              <span className="text-muted-foreground">Duration:</span>{' '}
                              <span className="font-medium">
                                {formatDuration(track.duration)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format duration in seconds to MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
