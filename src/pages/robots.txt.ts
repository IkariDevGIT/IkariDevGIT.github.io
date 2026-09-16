import type { APIRoute } from 'astro';
import { getNsfwPostSlugs, getUnlistedPostSlugs } from '../lib/contentFiles.mjs';

export const GET: APIRoute = ({ site }) => {
  const lines = ['User-agent: *', 'Allow: /'];

  for (const slug of new Set([...getNsfwPostSlugs(), ...getUnlistedPostSlugs()])) {
    lines.push(`Disallow: /blog/${slug}/`);
  }

  lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).toString()}`);

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
