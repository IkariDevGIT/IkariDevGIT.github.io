import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { resourceGroupToMarkdown } from '../lib/resourcesText';

export const GET: APIRoute = async () => {
  const entry = await getEntry('resources', 'main');
  if (!entry) return new Response('Not found', { status: 404 });

  const lines = ['# Resources', '', entry.data.intro, ''];
  for (const section of entry.data.sections) {
    lines.push(resourceGroupToMarkdown(section), '');
  }

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
