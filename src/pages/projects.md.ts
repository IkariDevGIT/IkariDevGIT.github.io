import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { projectsToMarkdown } from '../lib/projects';

export const GET: APIRoute = async () => {
  const page = await getEntry('pages', 'projects');
  if (!page) return new Response('Not found', { status: 404 });

  const intro = (page.body ?? '').trim();
  const body = [`# ${page.data.title}`, intro, await projectsToMarkdown()].filter(Boolean).join('\n\n');
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
