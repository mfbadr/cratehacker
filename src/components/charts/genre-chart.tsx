'use client';

/**
 * Genre distribution bar chart
 */

import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { GenreDistribution } from '@/types/library';

interface GenreChartProps {
  data: GenreDistribution[];
}

export function GenreChart({ data }: GenreChartProps) {
  // Show top 15 genres
  const topGenres = data.slice(0, 15);
  const totalGenreOccurrences = data.reduce((sum, item) => sum + item.count, 0);

  if (topGenres.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Genre Distribution</h3>
        <div className="text-center text-muted-foreground py-8">
          No genre data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Genre Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Top {topGenres.length} genres ({totalGenreOccurrences.toLocaleString()} genre tags total)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topGenres}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="genre"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
