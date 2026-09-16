import type { APIRoute } from 'astro';
import { getAllPostMeta, sortByNewest } from '../lib/posts';

export const GET: APIRoute = async () => {
  const posts = sortByNewest(await getAllPostMeta()).filter((post) => !post.tags.includes('nsfw'));

  const lines = ['# Blog', '', 'Every post, newest first. Each links to its own markdown version.', ''];
  for (const post of posts) {
    lines.push(
      post.repost
        ? `- [${post.title}](${post.repost}) (repost): ${post.description}`
        : `- [${post.title}](/blog/${post.slug}.md): ${post.description}`,
    );
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
