'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { useProjectStore } from '@/stores/project-store';
import { useFilterStore } from '@/stores/filter-store';
import type { Json } from '@/types/database';

interface ConversionEvent {
  id: string;
  tracking_id: string;
  created_at: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string | null;
  utm_term: string | null;
  page_url: string;
  referrer: string | null;
  user_agent: string;
  conversion_data: Json | null;
}

interface ConversionsResponse {
  data: ConversionEvent[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ConversionsPage() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const { dateFrom, dateTo, source, medium, campaign } = useFilterStore();
  const [conversions, setConversions] = useState<ConversionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProjectId) return;

    let cancelled = false;
    setLoading(true);

    async function load() {
      const params = new URLSearchParams({
        project_id: activeProjectId!,
        date_from: dateFrom,
        date_to: dateTo,
        page: String(page),
        limit: '25',
      });
      if (source) params.set('source', source);
      if (medium) params.set('medium', medium);
      if (campaign) params.set('campaign', campaign);
      if (searchTerm) params.set('search', searchTerm);

      try {
        const res = await fetch(`/api/analytics/conversions?${params}`);
        if (res.ok && !cancelled) {
          setConversions(await res.json());
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeProjectId, dateFrom, dateTo, source, medium, campaign, searchTerm, page]);

  const debouncedSearch = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSearchTerm(value);
        setPage(1);
      }, 300);
    };
  }, []);

  function getConversionField(data: Json | null, field: string): string {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return '-';
    return String((data as Record<string, unknown>)[field] || '-');
  }

  async function exportCsv() {
    if (!conversions?.data.length) return;

    const headers = ['Data/Hora', 'Nome', 'Email', 'Telefone', 'Source', 'Medium', 'Campaign', 'Pagina'];
    const rows = conversions.data.map((c) => [
      new Date(c.created_at).toLocaleString('pt-BR'),
      getConversionField(c.conversion_data, 'name'),
      getConversionField(c.conversion_data, 'email'),
      getConversionField(c.conversion_data, 'phone'),
      c.utm_source,
      c.utm_medium,
      c.utm_campaign,
      c.page_url,
    ]);

    const bom = '\uFEFF';
    const csv = bom + [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversoes-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conversoes</h1>
          <p className="text-muted-foreground">
            Lista completa de conversoes com dados de contato.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={!conversions?.data.length}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <FilterBar />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por source, medium, campaign..."
          className="pl-9"
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !conversions?.data.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">Nenhuma conversao encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-muted-foreground">
                  <th className="px-3 py-2">Data/Hora</th>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Telefone</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Medium</th>
                  <th className="px-3 py-2">Campaign</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {conversions.data.map((c) => (
                  <>
                    <tr
                      key={c.id}
                      className="cursor-pointer border-b border-zinc-900 hover:bg-zinc-900/50"
                      onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}
                    >
                      <td className="px-3 py-2">{new Date(c.created_at).toLocaleString('pt-BR')}</td>
                      <td className="px-3 py-2">{getConversionField(c.conversion_data, 'name')}</td>
                      <td className="px-3 py-2">{getConversionField(c.conversion_data, 'email')}</td>
                      <td className="px-3 py-2">{getConversionField(c.conversion_data, 'phone')}</td>
                      <td className="px-3 py-2">{c.utm_source}</td>
                      <td className="px-3 py-2">{c.utm_medium}</td>
                      <td className="px-3 py-2">{c.utm_campaign}</td>
                      <td className="px-3 py-2">
                        {expandedRow === c.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </td>
                    </tr>
                    {expandedRow === c.id && (
                      <tr key={`${c.id}-detail`} className="border-b border-zinc-900 bg-zinc-950">
                        <td colSpan={8} className="px-6 py-3">
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div><span className="font-medium">Tracking ID:</span> {c.tracking_id}</div>
                            <div><span className="font-medium">Content:</span> {c.utm_content || '-'}</div>
                            <div><span className="font-medium">Term:</span> {c.utm_term || '-'}</div>
                            <div><span className="font-medium">Referrer:</span> {c.referrer || '-'}</div>
                            <div className="col-span-2"><span className="font-medium">Pagina:</span> {c.page_url}</div>
                            <div className="col-span-2"><span className="font-medium">User Agent:</span> {c.user_agent}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {conversions.data.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="font-medium">{getConversionField(c.conversion_data, 'name')}</div>
                    <div className="text-muted-foreground">{getConversionField(c.conversion_data, 'email')}</div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{c.utm_source}</span>
                      <span>{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {conversions.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {conversions.total} conversoes — Pagina {conversions.page} de {conversions.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= conversions.totalPages}
                >
                  Proximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
