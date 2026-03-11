'use client';

import { useMemo } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface UrlPreviewProps {
  baseUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
}

export function buildUtmUrl(
  baseUrl: string,
  params: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
  },
): string {
  if (!baseUrl) return '';
  try {
    const url = new URL(baseUrl);
    if (params.utm_source) url.searchParams.set('utm_source', params.utm_source);
    if (params.utm_medium) url.searchParams.set('utm_medium', params.utm_medium);
    if (params.utm_campaign) url.searchParams.set('utm_campaign', params.utm_campaign);
    if (params.utm_content) url.searchParams.set('utm_content', params.utm_content);
    if (params.utm_term) url.searchParams.set('utm_term', params.utm_term);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function UrlPreview({
  baseUrl,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
  utmTerm,
}: UrlPreviewProps) {
  const previewUrl = useMemo(
    () =>
      buildUtmUrl(baseUrl, {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
      }),
    [baseUrl, utmSource, utmMedium, utmCampaign, utmContent, utmTerm],
  );

  async function handleCopy() {
    if (!previewUrl) return;
    await navigator.clipboard.writeText(previewUrl);
    toast.success('Copiado!');
  }

  if (!baseUrl) {
    return (
      <div className="rounded-md border border-dashed border-zinc-700 p-3">
        <p className="text-xs text-muted-foreground">
          Selecione uma pagina destino para ver o preview da URL.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-900 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 break-all text-xs text-blue-400">{previewUrl}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          className="shrink-0"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
