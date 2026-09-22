import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { resourceListMarkdown } from '../lib/resourcesText';

export const GET: APIRoute = async () => {
  const list = await getEntry('resources', 'main');
  if (!list) return new Response('Not found', { status: 404 });
  return resourceListMarkdown(list);
};
