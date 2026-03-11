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
    .select('event_type, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
  if (source) query = query.eq('utm_source', source);
  if (medium) query = query.eq('utm_medium', medium);
  if (campaign) query = query.eq('utm_campaign', campaign);

  const { data: events } = await query;

  // Group by date
  const dateMap: Record<string, { clicks: number; conversions: number }> = {};

  events?.forEach((e) => {
    const date = e.created_at.split('T')[0];
    if (!dateMap[date]) dateMap[date] = { clicks: 0, conversions: 0 };
    if (e.event_type === 'click' || e.event_type === 'pageview') {
      dateMap[date].clicks++;
    } else if (e.event_type === 'conversion') {
      dateMap[date].conversions++;
    }
  });

  const timeline = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      ...counts,
    }));

  return NextResponse.json(timeline);
}
