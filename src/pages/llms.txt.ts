import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { getAllPostMeta, sortByNewest } from '../lib/posts';
import { SITE_TITLE } from '../consts';

// https://llmstxt.org/
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://ikari.sillytilly.org/').replace(/\/$/, '');

  const home = await getEntry('pages', 'home');
  const about = await getEntry('pages', 'about');
  const projects = await getEntry('pages', 'projects');
  const resources = await getEntry('resources', 'main');
  const blog = await getEntry('pages', 'blog');

  const posts = sortByNewest(await getAllPostMeta()).filter((post) => !post.tags.includes('nsfw'));
  const currentPosts = posts.filter((post) => !post.tags.includes('legacy'));
  const legacyPosts = posts.filter((post) => post.tags.includes('legacy'));

  function link(path: string, label: string, description?: string): string {
    const url = `${base}${path}`;
    return description ? `- [${label}](${url}): ${description}` : `- [${label}](${url})`;
  }

  const lines: string[] = [];
  lines.push(`# ${SITE_TITLE}`, '', `> ${home?.data.description ?? ''}`, '');

  lines.push(
    'Every page and post below has a plain-markdown version at the same path with a `.md`',
    'extension (e.g. `/about.md`, `/blog/some-post.md`). Fetch that, not the linked HTML',
    'page, which carries nav/sidebar/footer chrome with no content value.',
    '',
    'Do not use `/blog/` (client-side rendered: search, sort, and pagination all run in',
    'JavaScript, so it returns an empty shell without it) or `/blog-nojs/*` (a static',
    'fallback for that, but splits posts across several sort/pagination URLs instead of',
    'listing them in one place). Use `/blog.md` instead: one flat, complete list of every',
    'post, plain markdown, no JavaScript involved.',
    '',
  );

  lines.push('## Pages', '');
  lines.push(link('/index.md', 'Home', home?.data.description));
  lines.push(link('/about.md', 'About', about?.data.description));
  lines.push(link('/projects.md', 'Projects', projects?.data.description));
  lines.push(link('/resources.md', 'Resources', resources?.data.intro));
  lines.push(link('/blog.md', 'Blog', blog?.data.description));
  lines.push('');

  lines.push('## Blog posts', '');
  for (const post of currentPosts) {
    if (post.repost) {
      lines.push(`- [${post.title}](${post.repost}) (repost, hosted elsewhere): ${post.description}`);
    } else {
      lines.push(link(`/blog/${post.slug}.md`, post.title, post.description));
    }
  }
  lines.push('');

  lines.push('## Optional', '');
  lines.push(link('/rss.xml', 'RSS feed'));
  lines.push(
    link(
      '/llms-full.txt',
      'llms-full.txt',
      'This same file, with full page and post content inlined instead of just links.',
    ),
  );
  for (const post of legacyPosts) {
    lines.push(link(`/blog/${post.slug}.md`, post.title, post.description));
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
