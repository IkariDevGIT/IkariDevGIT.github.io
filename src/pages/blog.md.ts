import type { APIRoute } from 'astro';
import { getAllPostMeta, sortByNewest } from '../lib/posts';
import { LEGACY_NOTE } from '../consts';

export const GET: APIRoute = async () => {
  const posts = sortByNewest(await getAllPostMeta()).filter((post) => !post.tags.includes('nsfw'));

  const lines = [
    '# Blog',
    '',
    'Every post, newest first. Each links to its own markdown version.',
    '',
    LEGACY_NOTE,
    '',
  ];
  for (const post of posts) {
    const kind = post.tags.includes('legacy') ? ' (legacy)' : post.repost ? ' (repost)' : '';
    lines.push(`- [${post.title}](/blog/${post.slug}.md)${kind}: ${post.description}`);
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
