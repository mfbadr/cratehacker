'use client';

/**
 * Key distribution chart (Camelot wheel notation)
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
import type { KeyDistribution } from '@/types/library';

interface KeyChartProps {
  data: KeyDistribution[];
}

export function KeyChart({ data }: KeyChartProps) {
  // Show top 20 keys
  const topKeys = data.slice(0, 20);
  const totalWithKey = data.reduce((sum, item) => sum + item.count, 0);

  if (topKeys.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Key Distribution</h3>
        <div className="text-center text-muted-foreground py-8">
          No key data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Key Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Camelot wheel notation ({totalWithKey.toLocaleString()} tracks)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topKeys}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="key"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
