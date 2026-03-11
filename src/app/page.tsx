import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
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
  );
}
