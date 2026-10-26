import rss from '@astrojs/rss';
import { getEntry } from 'astro:content';
import { getAllPostMeta, sortByNewest, rssCreators, REPOST_TAG, RSS_NAMESPACES } from '../lib/posts';
import { SITE_TITLE } from '../consts';

export async function GET(context) {
  const posts = sortByNewest(await getAllPostMeta()).filter((post) => !post.tags.includes(REPOST_TAG));
  const home = await getEntry('pages', 'home');

  return rss({
    title: `${SITE_TITLE} (no reposts)`,
    description: home.data.description,
    site: context.site,
    xmlns: RSS_NAMESPACES,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.pubDate,
      description: post.description,
      link: `/blog/${post.slug}/`,
      customData: rssCreators(post),
    })),
  });
}
