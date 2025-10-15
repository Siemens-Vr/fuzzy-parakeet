import apps from '@/data/apps.json';
import type { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const app = (apps as any[]).find((a) => a.slug === slug);
  if (!app) return new Response('Not found', { status: 404 });

  const base = process.env.DL_BASE_URL?.replace(/\/$/, '') || '';
  const target = `${base}/${encodeURIComponent(app.filename)}`;

  return new Response(null, {
    status: 302,
    headers: { Location: target, 'Cache-Control': 'public, max-age=60' },
  });
}
