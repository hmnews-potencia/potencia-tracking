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
  const search = params.get('search');
  const page = parseInt(params.get('page') || '1', 10);
  const limit = parseInt(params.get('limit') || '25', 10);
  const sortBy = params.get('sort_by') || 'created_at';
  const sortOrder = params.get('sort_order') === 'asc' ? true : false;

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  let query = supabase
    .from('tracking_events')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .eq('event_type', 'conversion')
    .order(sortBy, { ascending: sortOrder });

  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
  if (source) query = query.eq('utm_source', source);
  if (medium) query = query.eq('utm_medium', medium);
  if (campaign) query = query.eq('utm_campaign', campaign);

  // Search in conversion_data (text search on JSON)
  if (search) {
    query = query.or(
      `utm_source.ilike.%${search}%,utm_medium.ilike.%${search}%,utm_campaign.ilike.%${search}%`,
    );
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
