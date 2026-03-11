import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sanitizeUtmParam } from '@/lib/utils/utm';
import { generateShortSlug } from '@/lib/utils/short-slug';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');

  if (!projectId) {
    return NextResponse.json(
      { error: 'project_id is required' },
      { status: 400 },
    );
  }

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('utm_links')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count, page, limit });
}

function buildFullUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    project_id,
    page_id,
    label,
    base_url,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
  } = body;

  if (!project_id || !label || !base_url || !utm_source) {
    return NextResponse.json(
      { error: 'project_id, label, base_url, and utm_source are required' },
      { status: 400 },
    );
  }

  const sanitizedSource = sanitizeUtmParam(utm_source);
  const sanitizedMedium = utm_medium ? sanitizeUtmParam(utm_medium) : '';
  const sanitizedCampaign = utm_campaign ? sanitizeUtmParam(utm_campaign) : '';
  const sanitizedContent = utm_content ? sanitizeUtmParam(utm_content) : null;
  const sanitizedTerm = utm_term ? sanitizeUtmParam(utm_term) : null;

  const fullUrl = buildFullUrl(base_url, {
    utm_source: sanitizedSource,
    utm_medium: sanitizedMedium,
    utm_campaign: sanitizedCampaign,
    ...(sanitizedContent && { utm_content: sanitizedContent }),
    ...(sanitizedTerm && { utm_term: sanitizedTerm }),
  });

  const shortSlug = generateShortSlug();

  const { data, error } = await supabase
    .from('utm_links')
    .insert({
      project_id,
      page_id: page_id || null,
      label,
      base_url,
      utm_source: sanitizedSource,
      utm_medium: sanitizedMedium,
      utm_campaign: sanitizedCampaign,
      utm_content: sanitizedContent,
      utm_term: sanitizedTerm,
      short_slug: shortSlug,
      full_url: fullUrl,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Short slug collision — please try again' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
