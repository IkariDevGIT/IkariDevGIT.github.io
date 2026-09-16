import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { renderOgImage, type OgImageOptions } from '../../../lib/ogImage';
import { SITE_TITLE } from '../../../consts';

type Props = Omit<OgImageOptions, 'url'> & { pathname: string; url?: string };

export const getStaticPaths = (async () => {
  const resources = await getEntry('resources', 'main');
  const posts = await getCollection('blog');

  const page = async (id: string, label: string, pathname: string, title?: string): Promise<{ path: string; props: Props }> => {
    const entry = await getEntry('pages', id);
    if (!entry) throw new Error(`Missing src/content/pages/${id}.md`);
    return { path: id, props: { label, title: title ?? entry.data.title, description: entry.data.description, pathname } };
  };

  const pages: { path: string; props: Props }[] = [
    { ...(await page('home', 'Home', '/', SITE_TITLE)), path: 'index' },
    await page('about', 'About', '/about/'),
    await page('projects', 'Projects', '/projects/'),
    {
      path: 'resources',
      props: { label: 'Resources', title: 'Resources', description: resources?.data.intro ?? '', pathname: '/resources/' },
    },
    await page('blog', 'Blog', '/blog/'),
    { ...(await page('404', '404', '/404')), path: '404' },
    ...posts.map((entry) => {
      const isRepost = entry.id.startsWith('repost/');
      const isLegacy = entry.id.startsWith('legacy/');
      return {
        path: `blog/${entry.id}`,
        props: {
          label: isRepost ? 'Repost' : isLegacy ? 'Legacy' : 'Blog',
          theme: isRepost ? ('repost' as const) : isLegacy ? ('legacy' as const) : ('default' as const),
          title: entry.data.title,
          description: entry.data.description,
          pathname: `/blog/${entry.id}/`,
        },
      };
    }),
  ];

  return pages.map(({ path, props }) => ({ params: { path }, props }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const { pathname, url, ...options } = props as Props;
  const shown = url ?? new URL(pathname, site).toString().replace(/^https?:\/\//, '').replace(/\/$/, '');
  return renderOgImage({ ...options, url: shown });
};
