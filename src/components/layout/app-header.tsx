'use client';

import { Zap } from 'lucide-react';
import { ProjectSwitcher } from '@/components/layout/project-switcher';
import { UserNav } from '@/components/layout/user-nav';

interface AppHeaderProps {
  email: string | undefined;
}

export function AppHeader({ email }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">Potencia</span>
              <span className="text-foreground"> Tracking</span>
            </span>
          </div>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <ProjectSwitcher />
        </div>
        <UserNav email={email} />
      </div>
    </header>
  );
}
