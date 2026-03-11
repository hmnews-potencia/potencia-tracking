'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/stores/project-store';

function getActiveProjectFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)active-project=([^;]*)/);
  return match ? match[1] : null;
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  useEffect(() => {
    if (!activeProjectId) {
      const cookieId = getActiveProjectFromCookie();
      if (cookieId) {
        setActiveProject(cookieId);
      }
    }
  }, [activeProjectId, setActiveProject]);

  return <>{children}</>;
}
