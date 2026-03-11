'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Code, Globe, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/stores/project-store';

export default function TrackingSettingsPage() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [projectSlug, setProjectSlug] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedConversion, setCopiedConversion] = useState(false);
  const [hasRecentData, setHasRecentData] = useState<boolean | null>(null);

  const apiBase = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (!activeProjectId) return;

    let cancelled = false;

    async function loadData() {
      try {
        const [projectRes, linksRes] = await Promise.all([
          fetch(`/api/projects/${activeProjectId}`),
          fetch(`/api/links?project_id=${activeProjectId}&limit=1`),
        ]);

        if (cancelled) return;

        if (projectRes.ok) {
          const data = await projectRes.json();
          setProjectSlug(data.slug);
        }

        if (linksRes.ok) {
          const data = await linksRes.json();
          setHasRecentData(data.data && data.data.length > 0);
        }
      } catch {
        if (!cancelled) setHasRecentData(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [activeProjectId]);

  const snippet = `<script
  src="${apiBase}/tracking/pt-tracker.js"
  data-project="${projectSlug || 'seu-projeto'}"
  data-api="${apiBase}"
  async defer>
</script>`;

  const conversionExample = `// Quando o visitante converter (ex: formulario enviado)
PotenciaTracker.trackConversion({
  name: "Nome do Lead",
  email: "email@exemplo.com",
  phone: "(11) 99999-9999",
  source: "formulario-contato"
});`;

  async function copyToClipboard(text: string, type: 'snippet' | 'conversion') {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'snippet') {
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
      } else {
        setCopiedConversion(true);
        setTimeout(() => setCopiedConversion(false), 2000);
      }
      toast.success('Copiado para a area de transferencia');
    } catch {
      toast.error('Erro ao copiar');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Configuracoes de Tracking</h1>
        <p className="text-muted-foreground">
          Instale o script de tracking no seu site para capturar pageviews e conversoes.
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {hasRecentData === null ? (
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
            Verificando...
          </span>
        ) : hasRecentData ? (
          <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-sm text-emerald-400">
            Tracking Ativo
          </span>
        ) : (
          <span className="rounded-full bg-amber-900/50 px-3 py-1 text-sm text-amber-400">
            Sem dados recentes
          </span>
        )}
      </div>

      {/* Installation Snippet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Snippet de Instalacao
          </CardTitle>
          <CardDescription>
            Adicione este codigo antes do fechamento da tag {'</body>'} do seu site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="overflow-x-auto rounded-md bg-zinc-900 p-4 text-sm text-zinc-300">
              <code>{snippet}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute right-2 top-2"
              onClick={() => copyToClipboard(snippet, 'snippet')}
            >
              {copiedSnippet ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Tracking de Conversao
          </CardTitle>
          <CardDescription>
            Chame este metodo quando o visitante realizar uma conversao (envio de formulario, compra, etc).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="overflow-x-auto rounded-md bg-zinc-900 p-4 text-sm text-zinc-300">
              <code>{conversionExample}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute right-2 top-2"
              onClick={() => copyToClipboard(conversionExample, 'conversion')}
            >
              {copiedConversion ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Guia por Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <h3 className="mb-2 font-semibold">HTML Estatico</h3>
            <p className="text-sm text-muted-foreground">
              Cole o snippet acima antes do {'</body>'} no seu arquivo HTML.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">WordPress</h3>
            <p className="text-sm text-muted-foreground">
              Acesse Aparencia → Editor de Tema → footer.php e cole o snippet antes do {'</body>'}.
              Ou use um plugin como &quot;Insert Headers and Footers&quot;.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">React / Next.js</h3>
            <pre className="overflow-x-auto rounded-md bg-zinc-900 p-4 text-sm text-zinc-300">
              <code>{`// No layout principal (layout.tsx ou _document.tsx)
<Script
  src="${apiBase}/tracking/pt-tracker.js"
  data-project="${projectSlug || 'seu-projeto'}"
  data-api="${apiBase}"
  strategy="afterInteractive"
/>`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
