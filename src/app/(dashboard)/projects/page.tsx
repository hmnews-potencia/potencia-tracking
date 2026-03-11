'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Globe, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NewProjectDialog } from '@/components/projects/new-project-dialog';
import { useProjectStore } from '@/stores/project-store';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_url: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok && !cancelled) {
          setProjects(await res.json());
        }
      } catch {
        toast.error('Erro ao carregar projetos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  function handleProjectCreated(project: { id: string; name: string; slug: string }) {
    setProjects((prev) => [project as Project, ...prev]);
    setActiveProject(project.id);
    setDialogOpen(false);
    toast.success('Projeto criado com sucesso');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e suas configuracoes de tracking.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">Nenhum projeto criado ainda</p>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Projeto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isActive = project.id === activeProjectId;

            return (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all hover:border-primary/40 ${
                  isActive ? 'border-primary/60 ring-1 ring-primary/20' : ''
                }`}
                onClick={() => {
                  setActiveProject(project.id);
                  toast.success(`Projeto ativo: ${project.name}`);
                }}
              >
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold leading-tight">{project.name}</h3>
                      {project.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <span className="ml-2 shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                        Ativo
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{project.base_url || 'Sem URL'}</span>
                      {project.base_url && (
                        <a
                          href={project.base_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 rounded-md bg-muted/50 px-2 py-1 text-xs font-mono text-muted-foreground">
                    /{project.slug}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
