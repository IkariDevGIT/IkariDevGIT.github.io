import rss from '@astrojs/rss';
import { getEntry } from 'astro:content';
import { getAllPostMeta, sortByNewest } from '../lib/posts';
import { SITE_TITLE } from '../consts';

export async function GET(context) {
  const posts = sortByNewest(await getAllPostMeta());
  const home = await getEntry('pages', 'home');

  return rss({
    title: SITE_TITLE,
    description: home.data.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.pubDate,
      description: post.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
