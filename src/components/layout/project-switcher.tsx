'use client';

import { useEffect, useState } from 'react';
import { ChevronsUpDown, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectStore } from '@/stores/project-store';
import { NewProjectDialog } from '@/components/projects/new-project-dialog';

interface Project {
  id: string;
  name: string;
  slug: string;
}

export function ProjectSwitcher() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProjects(data);
          // Auto-select first project if none active
          if (!activeProjectId && data.length > 0) {
            setActiveProject(data[0].id);
          }
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setActiveProject(project.id);
    setDialogOpen(false);
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="w-44">
        <span className="animate-pulse text-xs">Carregando...</span>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm" className="w-44 justify-between gap-1 border-border/60 bg-background/50 text-sm" />
          }
        >
          <span className="truncate text-xs">
            {activeProject?.name || 'Selecionar projeto'}
          </span>
          <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={4}>
          <DropdownMenuLabel>Projetos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setActiveProject(project.id)}
            >
              {activeProjectId === project.id && (
                <Check className="h-3 w-3 text-primary" />
              )}
              <span className={activeProjectId === project.id ? 'font-medium text-primary' : ''}>
                {project.name}
              </span>
            </DropdownMenuItem>
          ))}
          {projects.length === 0 && (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">Nenhum projeto</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Projeto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
}
