import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { ProjectProvider } from '@/components/providers/project-provider';
import { AppLayout } from '@/components/layout/app-layout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <ProjectProvider>
      <AppLayout email={user.email}>
        {children}
      </AppLayout>
    </ProjectProvider>
  );
}
