'use client';

import { Activity } from 'lucide-react';
import { ProjectSwitcher } from '@/components/layout/project-switcher';
import { UserNav } from '@/components/layout/user-nav';

interface AppHeaderProps {
  email: string | undefined;
}

export function AppHeader({ email }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-zinc-950">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              Potencia Tracking
            </span>
          </div>
          <ProjectSwitcher />
        </div>
        <UserNav email={email} />
      </div>
    </header>
  );
}
