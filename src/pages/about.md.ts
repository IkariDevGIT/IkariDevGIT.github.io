import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';

export const GET: APIRoute = async () => {
  const page = await getEntry('pages', 'about');
  if (!page) return new Response('Not found', { status: 404 });

  const body = `# ${page.data.title}\n\n${page.body ?? ''}`;
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
