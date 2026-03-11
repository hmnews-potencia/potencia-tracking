'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Copy,
  ExternalLink,
  Pencil,
  CopyPlus,
  Trash2,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useProjectStore } from '@/stores/project-store';
import { CreateLinkDialog } from '@/components/links/create-link-dialog';

interface UtmLink {
  id: string;
  label: string;
  short_slug: string;
  full_url: string;
  base_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string | null;
  utm_term: string | null;
  page_id: string | null;
  project_id: string;
  created_at: string;
}

type SortKey = 'label' | 'utm_source' | 'utm_medium' | 'utm_campaign' | 'created_at';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 20;

export default function LinksPage() {
  const [links, setLinks] = useState<UtmLink[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLink, setEditLink] = useState<UtmLink | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/links?project_id=${activeProjectId}&page=${page}&limit=${PAGE_SIZE}`,
      );
      if (res.ok) {
        const json = await res.json();
        setLinks(json.data || []);
        setTotal(json.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [activeProjectId, page]);

  useEffect(() => {
    if (activeProjectId) {
      fetchLinks();
    }
  }, [activeProjectId, fetchLinks]);

  function handleLinkCreated() {
    setDialogOpen(false);
    setEditLink(null);
    fetchLinks();
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/links/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        toast.success('Link duplicado');
        fetchLinks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao duplicar');
      }
    } catch {
      toast.error('Erro de conexao');
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        toast.success('Link excluido');
        setDeleteId(null);
        fetchLinks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao excluir');
      }
    } catch {
      toast.error('Erro de conexao');
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.utm_source.toLowerCase().includes(q) ||
        l.utm_medium.toLowerCase().includes(q) ||
        l.utm_campaign.toLowerCase().includes(q),
    );
  }, [links, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (!activeProjectId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
            <LinkIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Selecione um projeto para gerenciar links.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    return (
      <button
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => toggleSort(field)}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
        {sortKey === field && (
          <span className="text-foreground">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Links UTM</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os links de tracking do seu projeto.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Link
        </Button>
      </div>

      {/* Search */}
      {!loading && links.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por label, source, medium ou campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
            <LinkIcon className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Nenhum link criado</h2>
            <p className="text-center text-sm text-muted-foreground">
              Use o botao acima para criar seu primeiro link UTM.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto rounded-lg border border-zinc-800 md:block">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left"><SortHeader label="Label" field="label" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Short URL</th>
                  <th className="px-4 py-3 text-left"><SortHeader label="Source" field="utm_source" /></th>
                  <th className="px-4 py-3 text-left"><SortHeader label="Medium" field="utm_medium" /></th>
                  <th className="px-4 py-3 text-left"><SortHeader label="Campaign" field="utm_campaign" /></th>
                  <th className="px-4 py-3 text-left"><SortHeader label="Criado em" field="created_at" /></th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {sorted.map((link) => (
                  <tr key={link.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-medium text-foreground">{link.label}</td>
                    <td className="px-4 py-3 text-blue-400">/r/{link.short_slug}</td>
                    <td className="px-4 py-3 text-muted-foreground">{link.utm_source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{link.utm_medium}</td>
                    <td className="px-4 py-3 text-muted-foreground">{link.utm_campaign}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(link.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard(link.full_url)} title="Copiar URL">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard(`${window.location.origin}/r/${link.short_slug}`)} title="Copiar Short URL">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => { setEditLink(link); setDialogOpen(true); }} title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDuplicate(link.id)} title="Duplicar">
                          <CopyPlus className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(link.id)} title="Excluir">
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {sorted.map((link) => (
              <Card key={link.id}>
                <CardContent className="flex flex-col gap-2 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{link.label}</p>
                    <p className="text-xs text-blue-400">/r/{link.short_slug}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {link.utm_source}{link.utm_medium && ` / ${link.utm_medium}`}{link.utm_campaign && ` / ${link.utm_campaign}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(link.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.full_url)}>
                      <Copy className="mr-1 h-3 w-3" /> Copiar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setEditLink(link); setDialogOpen(true); }}>
                      <Pencil className="mr-1 h-3 w-3" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(link.id)}>
                      <CopyPlus className="mr-1 h-3 w-3" /> Duplicar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(link.id)}>
                      <Trash2 className="mr-1 h-3 w-3 text-red-400" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {total} links no total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center text-xs text-muted-foreground">
                  Pagina {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Proxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col gap-4 pt-6 pb-6">
              <h3 className="text-lg font-medium text-foreground">Excluir link?</h3>
              <p className="text-sm text-muted-foreground">
                Essa acao nao pode ser desfeita. O link sera removido permanentemente.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteId(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deleteId)}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CreateLinkDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditLink(null);
        }}
        onLinkCreated={handleLinkCreated}
        editLink={editLink}
      />
    </div>
  );
}
