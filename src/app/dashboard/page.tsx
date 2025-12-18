'use client';

/**
 * Dashboard page - Main analytics view
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { getLibrary } from '@/lib/storage';
import { computeAnalytics } from '@/lib/analytics';
import { StatsCards } from '@/components/stats-cards';
import { GenreChart } from '@/components/charts/genre-chart';
import { BpmChart } from '@/components/charts/bpm-chart';
import { KeyChart } from '@/components/charts/key-chart';
import { TimelineChart } from '@/components/charts/timeline-chart';
import { TrackTable } from '@/components/track-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Library, LibraryStats } from '@/types/library';

export default function DashboardPage() {
  const router = useRouter();
  const [library, setLibrary] = useState<Library | null>(null);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLibrary() {
      try {
        const lib = await getLibrary();

        if (!lib) {
          toast.error('No library found', {
            description: 'Please upload your Rekordbox XML file first',
          });
          router.push('/');
          return;
        }

        setLibrary(lib);

        // Compute analytics
        const analytics = computeAnalytics(lib);
        setStats(analytics);

        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load library', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
        setIsLoading(false);
      }
    }

    loadLibrary();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[400px]" />
            ))}
          </div>

          {/* Table skeleton */}
          <Skeleton className="h-[700px]" />
        </div>
      </div>
    );
  }

  if (!library || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Library Found</h2>
          <p className="text-muted-foreground mb-6">
            Please upload your Rekordbox XML file to get started
          </p>
          <Button asChild>
            <Link href="/">Upload Library</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Library Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Analyzing {library.metadata.fileName || 'your library'}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Upload New Library</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Parsed on {new Date(library.metadata.parsedAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span>{library.tracks.length.toLocaleString()} tracks</span>
            <span>•</span>
            <span>{library.playlists.length.toLocaleString()} playlists</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GenreChart data={stats.genreDistribution} />
          <BpmChart data={stats.bpmDistribution} />
          <KeyChart data={stats.keyDistribution} />
          <TimelineChart data={stats.libraryGrowth} />
        </div>

        {/* Track Table */}
        <div>
          <TrackTable tracks={library.tracks} />
        </div>
      </div>
    </div>
  );
}
