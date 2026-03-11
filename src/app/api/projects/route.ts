import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils/slug';

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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
  const { name, slug, description, base_url } = body;

  if (!name || !base_url) {
    return NextResponse.json(
      { error: 'name and base_url are required' },
      { status: 400 },
    );
  }

  const projectSlug = slug || generateSlug(name);

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, slug: projectSlug, description: description || null, base_url })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
