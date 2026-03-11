'use client';

import { useEffect, useState } from 'react';
import { MousePointerClick, Target, TrendingUp, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectStore } from '@/stores/project-store';
import { useFilterStore } from '@/stores/filter-store';

interface KpiData {
  clicks: number;
  conversions: number;
  conversionRate: number;
  topSource: string;
}

export function KpiCards() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const { dateFrom, dateTo, source, medium, campaign } = useFilterStore();
  const [data, setData] = useState<KpiData | null>(null);
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
        const res = await fetch(`/api/analytics/kpis?${params}`);
        if (res.ok && !cancelled) {
          setData(await res.json());
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeProjectId, dateFrom, dateTo, source, medium, campaign]);

  const cards = [
    {
      title: 'Total de Cliques',
      value: data?.clicks ?? 0,
      icon: MousePointerClick,
      format: 'number' as const,
    },
    {
      title: 'Total de Conversoes',
      value: data?.conversions ?? 0,
      icon: Target,
      format: 'number' as const,
    },
    {
      title: 'Taxa de Conversao',
      value: data?.conversionRate ?? 0,
      icon: TrendingUp,
      format: 'percent' as const,
    },
    {
      title: 'Top Source',
      value: data?.topSource ?? '-',
      icon: Globe,
      format: 'text' as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">
                {card.format === 'percent'
                  ? `${card.value}%`
                  : card.format === 'number'
                    ? Number(card.value).toLocaleString('pt-BR')
                    : card.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
