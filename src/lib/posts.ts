import { getCollection, render, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { resolvePostDates } from './postDates';
import { resolveAuthors } from './authors.mjs';

export interface PostAuthor {
  id: string;
  name: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  cover?: string;
  coverAlt?: string;
  /** ISO 8601 */
  pubDate: string;
  /** ISO 8601, omitted if never updated after publishing */
  updatedDate?: string;
  wordCount: number;
  minutesRead: number;
  repost?: string;
  authors: PostAuthor[];
}

export function postAuthors(entry: CollectionEntry<'blog'>) {
  return resolveAuthors(entry.data.authors, `src/content/blog/${entry.id}.md`);
}

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const RSS_NAMESPACES = { dc: 'http://purl.org/dc/elements/1.1/' };

export function rssCreators(post: PostMeta): string {
  return post.authors.map((author) => `<dc:creator>${escapeXml(author.name)}</dc:creator>`).join('');
}

async function resolveCover(data: CollectionEntry<'blog'>['data']): Promise<string | undefined> {
  if (!data.cover) return undefined;
  const optimized = await getImage({ src: data.cover, width: 640 });
  return optimized.src;
}

export const NSFW_TAG = 'nsfw';

export function isLegacyPost(entry: CollectionEntry<'blog'>): boolean {
  return entry.id === 'legacy' || entry.id.startsWith('legacy/');
}

export function isNsfwPost(entry: CollectionEntry<'blog'>): boolean {
  return entry.data.tags.includes(NSFW_TAG);
}

export const REPOST_TAG = 'repost';

export function isRepostPost(entry: CollectionEntry<'blog'>): boolean {
  return entry.id.startsWith('repost/');
}

export function withLegacyTag(entry: CollectionEntry<'blog'>): string[] {
  const tags = [...entry.data.tags];
  if (isLegacyPost(entry) && !tags.includes('legacy')) tags.push('legacy');
  if (isRepostPost(entry) && !tags.includes(REPOST_TAG)) tags.push(REPOST_TAG);
  return tags;
}

export const COMMENTS_DISABLED_NOTICE = 'Comments are disabled for this post.';

export function commentsDisabled(entry: CollectionEntry<'blog'>, tags: string[]): boolean {
  return entry.data.comments === false || tags.includes(NSFW_TAG) || tags.includes('legacy');
}

async function toPostMeta(entry: CollectionEntry<'blog'>): Promise<PostMeta> {
  if (isRepostPost(entry) && !entry.data.repost) {
    throw new Error(`${entry.id} is in repost/ but has no repost: url`);
  }

  const { remarkPluginFrontmatter } = await render(entry);
  const { pubDate, updatedDate } = resolvePostDates(entry.data, remarkPluginFrontmatter);

  return {
    slug: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    tags: withLegacyTag(entry),
    cover: await resolveCover(entry.data),
    coverAlt: entry.data.coverAlt,
    pubDate: pubDate.toISOString(),
    updatedDate: updatedDate?.toISOString(),
    wordCount: remarkPluginFrontmatter.wordCount ?? 0,
    minutesRead: remarkPluginFrontmatter.minutesRead ?? 1,
    repost: entry.data.repost,
    authors: postAuthors(entry).map(({ id, name }) => ({ id, name })),
  };
}

export async function getAllPostMeta(): Promise<PostMeta[]> {
  const entries = await getCollection('blog', ({ data }) => !data.unlisted);
  return Promise.all(entries.map(toPostMeta));
}

export async function getFeaturablePosts(): Promise<PostMeta[]> {
  return sortByNewest(await getAllPostMeta()).filter(
    (post) => !post.repost && !post.tags.includes('legacy') && !post.tags.includes(NSFW_TAG),
  );
}

export function sortByNewest(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));
}

export function sortByOldest(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => Date.parse(a.pubDate) - Date.parse(b.pubDate));
}

export function sortByLatestUpdate(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort(
    (a, b) => Date.parse(b.updatedDate ?? b.pubDate) - Date.parse(a.updatedDate ?? a.pubDate),
  );
}

export type SortMode = 'newest' | 'oldest' | 'latest-update';

export function sortPosts(posts: PostMeta[], sort: SortMode): PostMeta[] {
  switch (sort) {
    case 'oldest':
      return sortByOldest(posts);
    case 'latest-update':
      return sortByLatestUpdate(posts);
    case 'newest':
    default:
      return sortByNewest(posts);
  }
}
