'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProjectStore } from '@/stores/project-store';
import { UrlPreview } from '@/components/links/url-preview';
import { sanitizeUtmParam } from '@/lib/utils/utm';

const SOURCE_PRESETS = [
  'instagram', 'facebook', 'youtube', 'whatsapp', 'email',
  'google-ads', 'linkedin', 'bio', 'mautic', 'site',
];

const MEDIUM_PRESETS = [
  'social', 'cpc', 'email', 'banner', 'referral',
  'organic', 'direct', 'video', 'affiliate',
];

interface ProjectPage {
  id: string;
  name: string;
  url: string;
}

interface EditableLinkData {
  id: string;
  label: string;
  base_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string | null;
  utm_term: string | null;
  page_id: string | null;
  project_id: string;
}

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkCreated: () => void;
  editLink?: EditableLinkData | null;
}

export function CreateLinkDialog({
  open,
  onOpenChange,
  onLinkCreated,
  editLink,
}: CreateLinkDialogProps) {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const [pages, setPages] = useState<ProjectPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageUrl, setNewPageUrl] = useState('');

  const [label, setLabel] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!editLink;
  const selectedPage = pages.find((p) => p.id === selectedPageId);
  const baseUrl = selectedPage?.url || (isEditMode ? editLink.base_url : '');

  useEffect(() => {
    if (open && editLink) {
      setLabel(editLink.label);
      setUtmSource(editLink.utm_source);
      setUtmMedium(editLink.utm_medium);
      setUtmCampaign(editLink.utm_campaign);
      setUtmContent(editLink.utm_content || '');
      setUtmTerm(editLink.utm_term || '');
      if (editLink.page_id) setSelectedPageId(editLink.page_id);
    }
  }, [open, editLink]);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/pages`);
      if (res.ok) {
        const data = await res.json();
        setPages(data);
        if (data.length > 0) {
          setSelectedPageId((prev) => prev || data[0].id);
        }
      }
    } catch {
      // silently fail
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (open && activeProjectId) {
      fetchPages();
    }
  }, [open, activeProjectId, fetchPages]);

  async function handleAddPage() {
    if (!newPageName.trim() || !newPageUrl.trim()) {
      toast.error('Nome e URL da pagina sao obrigatorios');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${activeProjectId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPageName.trim(), url: newPageUrl.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erro ao criar pagina');
        return;
      }

      const page = await res.json();
      setPages((prev) => [...prev, page]);
      setSelectedPageId(page.id);
      setShowNewPage(false);
      setNewPageName('');
      setNewPageUrl('');
      toast.success('Pagina adicionada');
    } catch {
      toast.error('Erro de conexao');
    }
  }

  function resetForm() {
    setLabel('');
    setUtmSource('');
    setUtmMedium('');
    setUtmCampaign('');
    setUtmContent('');
    setUtmTerm('');
    setSelectedPageId(pages.length > 0 ? pages[0].id : '');
    setShowNewPage(false);
    setNewPageName('');
    setNewPageUrl('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!label.trim() || !utmSource.trim() || !baseUrl) {
      toast.error('Label, Source e Pagina destino sao obrigatorios');
      return;
    }

    setLoading(true);
    try {
      const url = isEditMode ? `/api/links/${editLink.id}` : '/api/links';
      const method = isEditMode ? 'PATCH' : 'POST';

      const payload = isEditMode
        ? {
            label: label.trim(),
            base_url: baseUrl,
            utm_source: sanitizeUtmParam(utmSource),
            utm_medium: utmMedium ? sanitizeUtmParam(utmMedium) : '',
            utm_campaign: utmCampaign ? sanitizeUtmParam(utmCampaign) : '',
            utm_content: utmContent ? sanitizeUtmParam(utmContent) : null,
            utm_term: utmTerm ? sanitizeUtmParam(utmTerm) : null,
          }
        : {
            project_id: activeProjectId,
            page_id: selectedPageId || null,
            label: label.trim(),
            base_url: baseUrl,
            utm_source: sanitizeUtmParam(utmSource),
            utm_medium: utmMedium ? sanitizeUtmParam(utmMedium) : undefined,
            utm_campaign: utmCampaign ? sanitizeUtmParam(utmCampaign) : undefined,
            utm_content: utmContent ? sanitizeUtmParam(utmContent) : undefined,
            utm_term: utmTerm ? sanitizeUtmParam(utmTerm) : undefined,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} link`);
        return;
      }

      toast.success(isEditMode ? 'Link atualizado' : 'Link criado com sucesso');
      onLinkCreated();
      resetForm();
    } catch {
      toast.error('Erro de conexao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Link UTM' : 'Novo Link UTM'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Atualize os campos do link UTM.'
              : 'Preencha os campos para gerar um link UTM padronizado.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Page Selector */}
          <div className="flex flex-col gap-2">
            <Label>Pagina Destino</Label>
            <div className="flex gap-2">
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-foreground"
              >
                <option value="">Selecionar pagina...</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewPage(!showNewPage)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {showNewPage && (
              <div className="flex flex-col gap-2 rounded-md border border-zinc-700 p-3">
                <Input
                  placeholder="Nome da pagina"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                />
                <Input
                  placeholder="https://exemplo.com.br/pagina"
                  value={newPageUrl}
                  onChange={(e) => setNewPageUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPage}
                >
                  Adicionar Pagina
                </Button>
              </div>
            )}
          </div>

          {/* Label */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-label">Label</Label>
            <Input
              id="link-label"
              placeholder="Ex: Instagram Stories - Lancamento"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          {/* Source */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-source">Source</Label>
            <Input
              id="link-source"
              placeholder="instagram"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              list="source-presets"
              required
            />
            <datalist id="source-presets">
              {SOURCE_PRESETS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* Medium */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-medium">Medium</Label>
            <Input
              id="link-medium"
              placeholder="social"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              list="medium-presets"
            />
            <datalist id="medium-presets">
              {MEDIUM_PRESETS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          {/* Campaign */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-campaign">Campaign</Label>
            <Input
              id="link-campaign"
              placeholder="lancamento-2026"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
            />
          </div>

          {/* Content (optional) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-content">Content (opcional)</Label>
            <Input
              id="link-content"
              placeholder="banner-hero"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
            />
          </div>

          {/* Term (optional) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-term">Term (opcional)</Label>
            <Input
              id="link-term"
              placeholder="eletrica"
              value={utmTerm}
              onChange={(e) => setUtmTerm(e.target.value)}
            />
          </div>

          {/* URL Preview */}
          <div className="flex flex-col gap-2">
            <Label>Preview da URL</Label>
            <UrlPreview
              baseUrl={baseUrl}
              utmSource={sanitizeUtmParam(utmSource)}
              utmMedium={sanitizeUtmParam(utmMedium)}
              utmCampaign={sanitizeUtmParam(utmCampaign)}
              utmContent={sanitizeUtmParam(utmContent)}
              utmTerm={sanitizeUtmParam(utmTerm)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditMode ? 'Salvando...' : 'Criando...'
                : isEditMode ? 'Salvar' : 'Criar Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
