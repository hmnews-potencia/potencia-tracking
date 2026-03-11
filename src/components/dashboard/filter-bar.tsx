'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilterStore, type PeriodPreset } from '@/stores/filter-store';
import { useProjectStore } from '@/stores/project-store';

const PERIOD_PRESETS: { label: string; value: PeriodPreset }[] = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
];

interface FilterOptions {
  sources: string[];
  mediums: string[];
  campaigns: string[];
}

export function FilterBar() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const {
    period,
    source,
    medium,
    campaign,
    setPeriod,
    setSource,
    setMedium,
    setCampaign,
    resetFilters,
    activeFilterCount,
  } = useFilterStore();

  const [options, setOptions] = useState<FilterOptions>({
    sources: [],
    mediums: [],
    campaigns: [],
  });

  useEffect(() => {
    if (!activeProjectId) return;

    let cancelled = false;

    async function loadFilters() {
      try {
        const res = await fetch(
          `/api/analytics/filters?project_id=${activeProjectId}`,
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          setOptions(data);
        }
      } catch {
        // silently fail
      }
    }

    loadFilters();

    return () => {
      cancelled = true;
    };
  }, [activeProjectId]);

  const filterCount = activeFilterCount();
  const selectClass =
    'rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-foreground';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Period Presets */}
      <div className="flex gap-1">
        {PERIOD_PRESETS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={period === p.value ? 'default' : 'outline'}
            onClick={() => setPeriod(p.value)}
            className="h-8 text-xs"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Source Filter */}
      {options.sources.length > 0 && (
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={selectClass}
        >
          <option value="">Source</option>
          {options.sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {/* Medium Filter */}
      {options.mediums.length > 0 && (
        <select
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
          className={selectClass}
        >
          <option value="">Medium</option>
          {options.mediums.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}

      {/* Campaign Filter */}
      {options.campaigns.length > 0 && (
        <select
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          className={selectClass}
        >
          <option value="">Campaign</option>
          {options.campaigns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      {/* Clear Filters */}
      {filterCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={resetFilters}
          className="h-8 gap-1 text-xs text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Limpar ({filterCount})
        </Button>
      )}
    </div>
  );
}
