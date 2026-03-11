import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateShortSlug } from '@/lib/utils/short-slug';
import type { Tables } from '@/types/database';

export async function POST(
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

  const { data: original, error: fetchError } = await supabase
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

  const { data, error } = await supabase
    .from('utm_links')
    .insert({
      project_id: original.project_id,
      page_id: original.page_id,
      label: `${original.label}-copy`,
      base_url: original.base_url,
      utm_source: original.utm_source,
      utm_medium: original.utm_medium,
      utm_campaign: original.utm_campaign,
      utm_content: original.utm_content,
      utm_term: original.utm_term,
      short_slug: generateShortSlug(),
      full_url: original.full_url,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
