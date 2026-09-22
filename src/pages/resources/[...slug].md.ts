import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { resourceListMarkdown } from '../../lib/resourcesText';

export const getStaticPaths = (async () => {
  const lists = await getCollection('resources');
  return lists.filter((list) => list.id !== 'main').map((list) => ({ params: { slug: list.id }, props: { list } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => resourceListMarkdown(props.list);
