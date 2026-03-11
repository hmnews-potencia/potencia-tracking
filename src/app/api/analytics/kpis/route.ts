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

  // Build query for current period
  let query = supabase
    .from('tracking_events')
    .select('event_type, utm_source', { count: 'exact' })
    .eq('project_id', projectId);

  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
  if (source) query = query.eq('utm_source', source);
  if (medium) query = query.eq('utm_medium', medium);
  if (campaign) query = query.eq('utm_campaign', campaign);

  const { data: events } = await query;

  const clicks = events?.filter((e) => e.event_type === 'click' || e.event_type === 'pageview').length ?? 0;
  const conversions = events?.filter((e) => e.event_type === 'conversion').length ?? 0;
  const conversionRate = clicks > 0 ? ((conversions / clicks) * 100) : 0;

  // Top source
  const sourceCounts: Record<string, number> = {};
  events?.forEach((e) => {
    if (e.utm_source) {
      sourceCounts[e.utm_source] = (sourceCounts[e.utm_source] || 0) + 1;
    }
  });
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  return NextResponse.json({
    clicks,
    conversions,
    conversionRate: Math.round(conversionRate * 100) / 100,
    topSource,
  });
}
