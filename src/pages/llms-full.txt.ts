import type { APIRoute } from 'astro';
import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';
import { getAllPostMeta, sortByNewest } from '../lib/posts';
import { resolvePostDates } from '../lib/postDates';
import { projectsToMarkdown } from '../lib/projects';
import { resourceGroupToMarkdown } from '../lib/resourcesText';
import { SITE_TITLE } from '../consts';

// https://llmstxt.org/
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://ikari.sillytilly.org/').replace(/\/$/, '');

  const home = await getEntry('pages', 'home');
  const about = await getEntry('pages', 'about');
  const projects = await getEntry('pages', 'projects');
  const resources = await getEntry('resources', 'main');

  const posts = sortByNewest(await getAllPostMeta()).filter((post) => !post.tags.includes('nsfw'));
  const blogEntries = await getCollection('blog');
  const entryBySlug = new Map<string, CollectionEntry<'blog'>>(blogEntries.map((e) => [e.id, e]));

  async function renderPostSection(slug: string): Promise<string[]> {
    const entry = entryBySlug.get(slug);
    if (!entry) return [];
    if (entry.data.repost) {
      return [`### ${entry.data.title}`, '', `Repost, full text hosted at ${entry.data.repost}`, '', entry.data.description, ''];
    }
    const { remarkPluginFrontmatter } = await render(entry);
    const { pubDate, updatedDate } = resolvePostDates(entry.data, remarkPluginFrontmatter);

    const out = [`### ${entry.data.title}`, '', `${base}/blog/${slug}.md`, ''];
    out.push(`Published: ${pubDate.toISOString()}`);
    if (updatedDate) out.push(`Updated: ${updatedDate.toISOString()}`);
    out.push('', entry.body ?? '', '');
    return out;
  }

  const lines: string[] = [];
  lines.push(`# ${SITE_TITLE}`, '', `> ${home?.data.description ?? ''}`, '');

  lines.push('## Pages', '');
  for (const page of [
    { entry: home, path: '/index.md', label: 'Home' },
    { entry: about, path: '/about.md', label: 'About' },
    { entry: projects, path: '/projects.md', label: 'Projects' },
  ]) {
    if (!page.entry) continue;
    lines.push(`### ${page.label}`, '', `${base}${page.path}`, '', page.entry.body ?? '', '');
    if (page.entry === projects) lines.push(await projectsToMarkdown(4), '');
  }

  lines.push('### Resources', '', `${base}/resources.md`, '');
  if (resources) {
    if (resources.data.intro) lines.push(resources.data.intro, '');
    for (const section of resources.data.sections) {
      lines.push(resourceGroupToMarkdown(section), '');
    }
  }

  lines.push('## Blog posts', '');
  for (const post of posts.filter((p) => !p.tags.includes('legacy'))) {
    lines.push(...(await renderPostSection(post.slug)));
  }

  lines.push('## Optional', '');
  for (const post of posts.filter((p) => p.tags.includes('legacy'))) {
    lines.push(...(await renderPostSection(post.slug)));
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
