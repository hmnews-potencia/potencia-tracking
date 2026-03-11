'use client';

import { useEffect, useState } from 'react';
import { MousePointerClick, Target, TrendingUp, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Total de Conversoes',
      value: data?.conversions ?? 0,
      icon: Target,
      format: 'number' as const,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Taxa de Conversao',
      value: data?.conversionRate ?? 0,
      icon: TrendingUp,
      format: 'percent' as const,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      title: 'Top Source',
      value: data?.topSource ?? '-',
      icon: Globe,
      format: 'text' as const,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {card.title}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <p className="mt-2 text-2xl font-bold tracking-tight">
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
