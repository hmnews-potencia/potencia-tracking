'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectStore } from '@/stores/project-store';
import { useFilterStore } from '@/stores/filter-store';

interface TimelinePoint {
  date: string;
  clicks: number;
  conversions: number;
}

interface SourceData {
  name: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

const SOURCE_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  youtube: '#FF0000',
  google: '#4285F4',
  'google-ads': '#FBBC04',
  linkedin: '#0A66C2',
  whatsapp: '#25D366',
  email: '#EA4335',
  direct: '#6B7280',
};

function getSourceColor(name: string): string {
  return SOURCE_COLORS[name.toLowerCase()] || '#8B5CF6';
}

export function AnalyticsCharts() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const { dateFrom, dateTo, source, medium, campaign } = useFilterStore();
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProjectId) return;

    let cancelled = false;
    setLoading(true);

    async function load() {
      const params = new URLSearchParams({
        project_id: activeProjectId!,
        date_from: dateFrom,
        date_to: dateTo,
      });
      if (source) params.set('source', source);
      if (medium) params.set('medium', medium);
      if (campaign) params.set('campaign', campaign);

      try {
        const [timelineRes, sourcesRes] = await Promise.all([
          fetch(`/api/analytics/timeline?${params}`),
          fetch(`/api/analytics/sources?${params}`),
        ]);

        if (cancelled) return;

        if (timelineRes.ok) setTimeline(await timelineRes.json());
        if (sourcesRes.ok) setSources(await sourcesRes.json());
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeProjectId, dateFrom, dateTo, source, medium, campaign]);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cliques ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cliques ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Sem dados para o periodo selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={12}
                  tickFormatter={(v: string) => {
                    const [, m, d] = v.split('-');
                    return `${d}/${m}`;
                  }}
                />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} name="Cliques" dot={false} />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} name="Conversoes" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sources Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Top Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Sem dados para o periodo selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={sources} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" stroke="#71717a" fontSize={12} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#71717a"
                  fontSize={12}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Bar dataKey="clicks" name="Cliques" radius={[0, 4, 4, 0]}>
                  {sources.map((entry) => (
                    <rect key={entry.name} fill={getSourceColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
