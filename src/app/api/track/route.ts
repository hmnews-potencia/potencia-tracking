import { NextResponse, after, type NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { hashIp } from '@/lib/utils/hash';
import { sanitizeUtmParam } from '@/lib/utils/utm';
import type { Tables, Json } from '@/types/database';

const IP_HASH_SALT = process.env.IP_HASH_SALT || 'potencia-tracking-default-salt';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

interface TrackPayload {
  project_slug: string;
  tracking_id: string;
  event_type: 'pageview' | 'click' | 'conversion';
  timestamp?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string | null;
  utm_term?: string | null;
  page_url?: string;
  referrer?: string | null;
  user_agent?: string;
  conversion_data?: Record<string, unknown> | null;
}

const VALID_EVENT_TYPES = ['pageview', 'click', 'conversion'];

export async function POST(request: NextRequest) {
  let body: TrackPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // Validate required fields
  if (!body.project_slug || !body.tracking_id || !body.event_type) {
    return NextResponse.json(
      { error: 'Missing required fields: project_slug, tracking_id, event_type' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  if (!VALID_EVENT_TYPES.includes(body.event_type)) {
    return NextResponse.json(
      { error: 'Invalid event_type. Must be: pageview, click, or conversion' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const supabase = createServiceRoleClient();

  // Lookup project by slug
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', body.project_slug)
    .single<Pick<Tables<'projects'>, 'id'>>();

  if (projectError || !project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  // Hash IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0';
  const ipHash = hashIp(ip, IP_HASH_SALT);

  // Check if tracking_id has prior events (for orphan detection)
  const isOrphan =
    body.event_type === 'conversion'
      ? await checkIsOrphan(supabase, body.tracking_id, project.id)
      : false;

  // Insert event asynchronously
  after(async () => {
    await supabase.from('tracking_events').insert({
      project_id: project.id,
      tracking_id: body.tracking_id,
      event_type: body.event_type,
      utm_source: body.utm_source ? sanitizeUtmParam(body.utm_source) : '',
      utm_medium: body.utm_medium ? sanitizeUtmParam(body.utm_medium) : '',
      utm_campaign: body.utm_campaign ? sanitizeUtmParam(body.utm_campaign) : '',
      utm_content: body.utm_content ? sanitizeUtmParam(body.utm_content) : null,
      utm_term: body.utm_term ? sanitizeUtmParam(body.utm_term) : null,
      page_url: body.page_url || '',
      referrer: body.referrer || null,
      user_agent: body.user_agent || '',
      ip_hash: ipHash,
      conversion_data: (body.conversion_data as Json) || null,
      is_orphan: isOrphan,
    });
  });

  // Return 202 Accepted immediately
  return NextResponse.json(
    { status: 'accepted' },
    { status: 202, headers: CORS_HEADERS },
  );
}

async function checkIsOrphan(
  supabase: ReturnType<typeof createServiceRoleClient>,
  trackingId: string,
  projectId: string,
): Promise<boolean> {
  const { count } = await supabase
    .from('tracking_events')
    .select('id', { count: 'exact', head: true })
    .eq('tracking_id', trackingId)
    .eq('project_id', projectId);

  return (count ?? 0) === 0;
}
