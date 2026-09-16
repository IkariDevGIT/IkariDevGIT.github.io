import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, render } from 'astro:content';
import { resolvePostDates } from '../../lib/postDates';
import { withLegacyTag } from '../../lib/posts';

export const getStaticPaths = (async () => {
  const posts = await getCollection(
    'blog',
    ({ id, data }) => !data.unlisted && !id.startsWith('repost/') && !data.tags.includes('nsfw'),
  );
  return posts.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as Awaited<ReturnType<typeof getStaticPaths>>[number]['props'];
  const { remarkPluginFrontmatter } = await render(entry);
  const { pubDate, updatedDate } = resolvePostDates(entry.data, remarkPluginFrontmatter);
  const tags = withLegacyTag(entry);

  const lines = [
    `# ${entry.data.title}`,
    '',
    `Published: ${pubDate.toISOString()}`,
    ...(updatedDate ? [`Updated: ${updatedDate.toISOString()}`] : []),
    ...(tags.length > 0 ? [`Tags: ${tags.join(', ')}`] : []),
    '',
    entry.body ?? '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
