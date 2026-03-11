import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get('project_id');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  // Fetch distinct UTM values from tracking_events
  const [sourcesRes, mediumsRes, campaignsRes] = await Promise.all([
    supabase
      .from('tracking_events')
      .select('utm_source')
      .eq('project_id', projectId)
      .neq('utm_source', '')
      .limit(100),
    supabase
      .from('tracking_events')
      .select('utm_medium')
      .eq('project_id', projectId)
      .neq('utm_medium', '')
      .limit(100),
    supabase
      .from('tracking_events')
      .select('utm_campaign')
      .eq('project_id', projectId)
      .neq('utm_campaign', '')
      .limit(100),
  ]);

  const unique = (arr: Record<string, string>[] | null, key: string): string[] => {
    if (!arr) return [];
    return [...new Set(arr.map((item) => item[key]).filter(Boolean))].sort();
  };

  return NextResponse.json({
    sources: unique(sourcesRes.data as Record<string, string>[] | null, 'utm_source'),
    mediums: unique(mediumsRes.data as Record<string, string>[] | null, 'utm_medium'),
    campaigns: unique(campaignsRes.data as Record<string, string>[] | null, 'utm_campaign'),
  });
}
