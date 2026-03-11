'use client';

import { useEffect, useState } from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';
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
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProject(projects[0].id);
    }
  }, [projects, activeProjectId, setActiveProject]);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setActiveProject(project.id);
    setDialogOpen(false);
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="w-40">
        <span className="animate-pulse">Carregando...</span>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm" className="w-40 justify-between" />
          }
        >
          <span className="truncate">
            {activeProject?.name || 'Selecionar projeto'}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={4}>
          <DropdownMenuLabel>Projetos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setActiveProject(project.id)}
            >
              <span className={activeProjectId === project.id ? 'font-medium' : ''}>
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
