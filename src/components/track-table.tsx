'use client';

/**
 * Virtualized searchable track table
 */

import { useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Track } from '@/types/library';
import { formatDuration } from '@/lib/constants';
import { joinGenres } from '@/lib/genre-utils';

interface TrackTableProps {
  tracks: Track[];
}

type SortField = 'title' | 'artist' | 'bpm' | 'key' | 'playCount';
type SortDirection = 'asc' | 'desc';

export function TrackTable({ tracks }: TrackTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter tracks based on search query
  const filteredTracks = useMemo(() => {
    if (!searchQuery) return tracks;

    const query = searchQuery.toLowerCase();
    return tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album?.toLowerCase().includes(query) ||
        track.genre?.some((g) => g.toLowerCase().includes(query))
    );
  }, [tracks, searchQuery]);

  // Sort tracks
  const sortedTracks = useMemo(() => {
    const sorted = [...filteredTracks];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle undefined values
      if (aVal === undefined) aVal = '';
      if (bVal === undefined) bVal = '';

      // Convert to lowercase for string comparison
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTracks, sortField, sortDirection]);

  // Virtualization setup
  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: sortedTracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <Card className="p-6">
      <div className="mb-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Track List</h3>
          <p className="text-sm text-muted-foreground">
            {sortedTracks.length.toLocaleString()} of {tracks.length.toLocaleString()} tracks
          </p>
        </div>

        <Input
          type="search"
          placeholder="Search by title, artist, album, or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b font-medium text-sm">
          <button
            className="col-span-3 flex items-center gap-1 hover:text-primary text-left"
            onClick={() => handleSort('title')}
          >
            Title
            <SortIcon field="title" />
          </button>
          <button
            className="col-span-3 flex items-center gap-1 hover:text-primary text-left"
            onClick={() => handleSort('artist')}
          >
            Artist
            <SortIcon field="artist" />
          </button>
          <button
            className="col-span-1 flex items-center gap-1 hover:text-primary text-left"
            onClick={() => handleSort('bpm')}
          >
            BPM
            <SortIcon field="bpm" />
          </button>
          <button
            className="col-span-1 flex items-center gap-1 hover:text-primary text-left"
            onClick={() => handleSort('key')}
          >
            Key
            <SortIcon field="key" />
          </button>
          <div className="col-span-2 text-left">Genre</div>
          <div className="col-span-1 text-left">Duration</div>
          <button
            className="col-span-1 flex items-center gap-1 hover:text-primary text-right"
            onClick={() => handleSort('playCount')}
          >
            Plays
            <SortIcon field="playCount" />
          </button>
        </div>

        {/* Virtualized Table Body */}
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto"
          style={{ contain: 'strict' }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const track = sortedTracks[virtualRow.index];
              return (
                <div
                  key={virtualRow.index}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b hover:bg-muted/50 text-sm absolute top-0 left-0 w-full"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="col-span-3 truncate font-medium">{track.title}</div>
                  <div className="col-span-3 truncate text-muted-foreground">
                    {track.artist}
                  </div>
                  <div className="col-span-1">
                    {track.bpm ? Math.round(track.bpm) : 'N/A'}
                  </div>
                  <div className="col-span-1">
                    {track.key ? (
                      <Badge variant="outline" className="font-mono">
                        {track.key}
                      </Badge>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div className="col-span-2 truncate text-muted-foreground text-xs">
                    {joinGenres(track.genre)}
                  </div>
                  <div className="col-span-1 text-muted-foreground">
                    {formatDuration(track.duration)}
                  </div>
                  <div className="col-span-1 text-right text-muted-foreground">
                    {track.playCount || 0}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Add React import for ref
import React from 'react';
