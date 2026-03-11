import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
          <Activity className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground">
            Nenhum dado ainda
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            Crie links UTM e integre o script de tracking para começar a
            visualizar os dados do seu projeto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
