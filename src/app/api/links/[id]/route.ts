import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sanitizeUtmParam } from '@/lib/utils/utm';
import type { Tables } from '@/types/database';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from('utm_links')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

function buildFullUrl(baseUrl: string, params: Record<string, string | null>): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Fetch existing link to rebuild full_url
  const { data: existing, error: fetchError } = await supabase
    .from('utm_links')
    .select('*')
    .eq('id', id)
    .single<Tables<'utm_links'>>();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const updates: Record<string, string | null> = {};
  if (body.label !== undefined) updates.label = body.label;
  if (body.base_url !== undefined) updates.base_url = body.base_url;
  if (body.utm_source !== undefined) updates.utm_source = sanitizeUtmParam(body.utm_source);
  if (body.utm_medium !== undefined) updates.utm_medium = sanitizeUtmParam(body.utm_medium);
  if (body.utm_campaign !== undefined) updates.utm_campaign = sanitizeUtmParam(body.utm_campaign);
  if (body.utm_content !== undefined) updates.utm_content = body.utm_content ? sanitizeUtmParam(body.utm_content) : null;
  if (body.utm_term !== undefined) updates.utm_term = body.utm_term ? sanitizeUtmParam(body.utm_term) : null;

  // Rebuild full_url
  const finalBaseUrl = updates.base_url ?? existing.base_url;
  const finalSource = updates.utm_source ?? existing.utm_source;
  const finalMedium = updates.utm_medium ?? existing.utm_medium;
  const finalCampaign = updates.utm_campaign ?? existing.utm_campaign;
  const finalContent = updates.utm_content !== undefined ? updates.utm_content : existing.utm_content;
  const finalTerm = updates.utm_term !== undefined ? updates.utm_term : existing.utm_term;

  updates.full_url = buildFullUrl(finalBaseUrl, {
    utm_source: finalSource,
    utm_medium: finalMedium,
    utm_campaign: finalCampaign,
    utm_content: finalContent,
    utm_term: finalTerm,
  });

  const { data, error } = await supabase
    .from('utm_links')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('utm_links')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(null, { status: 204 });
}
