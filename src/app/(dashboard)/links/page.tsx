'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link as LinkIcon, Plus, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProjectStore } from '@/stores/project-store';
import { CreateLinkDialog } from '@/components/links/create-link-dialog';

interface UtmLink {
  id: string;
  label: string;
  short_slug: string;
  full_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  created_at: string;
}

export default function LinksPage() {
  const [links, setLinks] = useState<UtmLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links?project_id=${activeProjectId}`);
      if (res.ok) {
        const json = await res.json();
        setLinks(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      fetchLinks();
    }
  }, [activeProjectId, fetchLinks]);

  function handleLinkCreated() {
    setDialogOpen(false);
    fetchLinks();
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  }

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
            <h2 className="text-lg font-medium text-foreground">
              Nenhum link criado
            </h2>
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
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{link.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {link.utm_source}
                    {link.utm_medium && ` / ${link.utm_medium}`}
                    {link.utm_campaign && ` / ${link.utm_campaign}`}
                  </p>
                  <p className="truncate text-xs text-blue-400">
                    /r/{link.short_slug}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(link.full_url)}
                    title="Copiar URL completa"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/r/${link.short_slug}`,
                      )
                    }
                    title="Copiar Short URL"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onLinkCreated={handleLinkCreated}
      />
    </div>
  );
}
