import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';

interface AppLayoutProps {
  email: string | undefined;
  children: React.ReactNode;
}

export function AppLayout({ email, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader email={email} />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-background p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
