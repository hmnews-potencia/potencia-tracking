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

  const params = request.nextUrl.searchParams;
  const projectId = params.get('project_id');
  const dateFrom = params.get('date_from');
  const dateTo = params.get('date_to');
  const source = params.get('source');
  const medium = params.get('medium');
  const campaign = params.get('campaign');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  let query = supabase
    .from('tracking_events')
    .select('event_type, utm_source')
    .eq('project_id', projectId);

  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
  if (source) query = query.eq('utm_source', source);
  if (medium) query = query.eq('utm_medium', medium);
  if (campaign) query = query.eq('utm_campaign', campaign);

  const { data: events } = await query;

  // Aggregate by source
  const sourceMap: Record<string, { clicks: number; conversions: number }> = {};

  events?.forEach((e) => {
    const src = e.utm_source || 'direct';
    if (!sourceMap[src]) sourceMap[src] = { clicks: 0, conversions: 0 };
    if (e.event_type === 'click' || e.event_type === 'pageview') {
      sourceMap[src].clicks++;
    } else if (e.event_type === 'conversion') {
      sourceMap[src].conversions++;
    }
  });

  const sources = Object.entries(sourceMap)
    .map(([name, counts]) => ({
      name,
      ...counts,
      conversionRate: counts.clicks > 0 ? Math.round((counts.conversions / counts.clicks) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return NextResponse.json(sources);
}
