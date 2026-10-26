import type { APIRoute } from 'astro';
import { getAllPostMeta, sortByNewest } from '../lib/posts';
import { BLOG_PAGE_SIZE } from '../consts';

export const GET: APIRoute = async () => {
  const posts = sortByNewest(await getAllPostMeta());
  const tags = [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b));
  const authors = [...new Map(posts.flatMap((post) => post.authors).map((author) => [author.id, author])).values()].sort(
    (a, b) => a.name.localeCompare(b.name),
  );

  return new Response(
    JSON.stringify({
      pageSize: BLOG_PAGE_SIZE,
      tags,
      authors,
      posts,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
