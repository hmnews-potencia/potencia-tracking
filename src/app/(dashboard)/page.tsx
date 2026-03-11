'use client';

import { FilterBar } from '@/components/dashboard/filter-bar';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visao geral do tracking do projeto ativo.
        </p>
      </div>

      <FilterBar />
      <KpiCards />
      <AnalyticsCharts />
    </div>
  );
}
