import { type NextRequest, NextResponse, after } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { hashIp } from '@/lib/utils/hash';
import { randomUUID } from 'crypto';
import type { Tables } from '@/types/database';

const COOKIE_NAME = '_ptk_id';
const COOKIE_MAX_AGE = 180 * 24 * 60 * 60; // 180 days in seconds
const IP_HASH_SALT = process.env.IP_HASH_SALT || 'potencia-tracking-default-salt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createServiceRoleClient();

  // Lookup link by short_slug (service role bypasses RLS for performance)
  const { data: link, error } = await supabase
    .from('utm_links')
    .select('*')
    .eq('short_slug', slug)
    .single<Tables<'utm_links'>>();

  if (error || !link) {
    return new NextResponse(notFoundHtml(), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Read or generate tracking_id
  const existingTrackingId = request.cookies.get(COOKIE_NAME)?.value;
  const trackingId = existingTrackingId || randomUUID();

  // Build redirect response
  const response = NextResponse.redirect(link.full_url, 302);

  // Set tracking cookie if new
  if (!existingTrackingId) {
    response.cookies.set(COOKIE_NAME, trackingId, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  // Track click asynchronously (don't block the redirect)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0';

  after(async () => {
    await supabase.from('tracking_events').insert({
      project_id: link.project_id,
      link_id: link.id,
      tracking_id: trackingId,
      event_type: 'click' as const,
      utm_source: link.utm_source,
      utm_medium: link.utm_medium,
      utm_campaign: link.utm_campaign,
      utm_content: link.utm_content,
      utm_term: link.utm_term,
      page_url: link.full_url,
      referrer: request.headers.get('referer') || null,
      user_agent: request.headers.get('user-agent') || '',
      ip_hash: hashIp(ip, IP_HASH_SALT),
    });
  });

  return response;
}

function notFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link não encontrado</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #09090b; color: #fafafa; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 4rem; margin: 0 0 0.5rem; font-weight: 700; color: #a1a1aa; }
    p { color: #71717a; font-size: 1.125rem; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>Link não encontrado</p>
  </div>
</body>
</html>`;
}
