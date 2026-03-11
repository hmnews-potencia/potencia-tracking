import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserNav } from '@/components/layout/user-nav';
import { createServerClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              Potencia Tracking
            </span>
          </div>
          <UserNav email={user?.email} />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center py-24">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
            <Activity className="h-16 w-16 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Potencia Tracking
            </h1>
            <p className="text-sm text-muted-foreground">
              Plataforma de tracking UTM multi-projeto
            </p>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              v0.1.0
            </span>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
