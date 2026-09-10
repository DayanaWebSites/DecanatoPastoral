import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

const ROOT = process.env.UPLOAD_DIR || join(process.cwd(), 'apps/web/.data/uploads');

export const GET: APIRoute = async ({ params }) => {
  const rel = params.path;
  if (!rel || rel.includes('..')) return new Response('No', { status: 400 });
  try {
    const buf = await readFile(join(ROOT, rel));
    return new Response(buf, {
      headers: {
        'content-type': 'image/webp',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('No encontrada', { status: 404 });
  }
};
