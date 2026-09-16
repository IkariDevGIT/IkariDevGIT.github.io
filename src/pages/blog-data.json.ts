import type { APIRoute } from 'astro';
import { getAllPostMeta, sortByNewest } from '../lib/posts';
import { formatPostDate } from '../lib/dateFormat.mjs';
import { BLOG_PAGE_SIZE } from '../consts';

export const GET: APIRoute = async () => {
  const posts = sortByNewest(await getAllPostMeta()).map((post) => ({
    ...post,
    pubDateLabel: formatPostDate(post.pubDate),
    updatedDateLabel: post.updatedDate ? formatPostDate(post.updatedDate) : undefined,
  }));
  const tags = [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b));

  return new Response(
    JSON.stringify({
      pageSize: BLOG_PAGE_SIZE,
      tags,
      posts,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
