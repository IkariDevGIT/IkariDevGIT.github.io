import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getGitDates } from './gitDates.mjs';
import { resolvePostDates } from './postDates.ts';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const PAGES_DIR = path.join(process.cwd(), 'src/content/pages');
const PROJECTS_DIR = path.join(process.cwd(), 'src/content/projects');
const RESOURCES_FILE = path.join(process.cwd(), 'src/content/resources.yaml');

function resolveMarkdownLastmod(absPath) {
  const raw = readFileSync(absPath, 'utf-8');
  const { data } = matter(raw);
  const gitDates = getGitDates(absPath);
  const { pubDate, updatedDate } = resolvePostDates(
    { pubDate: data.pubDate, updatedDate: data.updatedDate },
    { gitCreated: gitDates?.created ?? null, gitUpdated: gitDates?.updated ?? null },
  );
  return updatedDate ?? pubDate;
}

function listMarkdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdownFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

export function readPost(slug) {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  const file = path.join(BLOG_DIR, `${clean}.md`);
  if (!existsSync(file)) return null;

  const { data } = matter(readFileSync(file, 'utf-8'));
  const gitDates = getGitDates(file);
  const { pubDate } = resolvePostDates(
    { pubDate: data.pubDate, updatedDate: data.updatedDate },
    { gitCreated: gitDates?.created ?? null, gitUpdated: gitDates?.updated ?? null },
  );

  return {
    slug: clean,
    title: data.title,
    description: data.description,
    pubDate,
    isLegacy: clean.startsWith('legacy/'),
    isRepost: clean.startsWith('repost/'),
    repost: data.repost,
  };
}

/** map of post slug -> resolved last-modified date */
export function getBlogPostLastmods() {
  const map = new Map();
  for (const file of listMarkdownFiles(BLOG_DIR)) {
    const slug = path.relative(BLOG_DIR, file).replace(/\.md$/, '').split(path.sep).join('/');
    map.set(slug, resolveMarkdownLastmod(file));
  }
  return map;
}

function collectSlugs(match) {
  const slugs = new Set();
  for (const file of listMarkdownFiles(BLOG_DIR)) {
    const { data, content } = matter(readFileSync(file, 'utf-8'));
    const slug = path.relative(BLOG_DIR, file).replace(/\.md$/, '').split(path.sep).join('/');
    if (match(data, slug, content)) {
      slugs.add(slug);
    }
  }
  return slugs;
}

export function getNsfwPostSlugs() {
  return collectSlugs((data) => data.tags?.includes('nsfw'));
}

export function getUnlistedPostSlugs() {
  return collectSlugs((data) => data.unlisted === true);
}

export function getEmptyRepostSlugs() {
  return collectSlugs((data, slug, content) => slug.startsWith('repost/') && !content.trim());
}

export function getPageLastmod(name) {
  return resolveMarkdownLastmod(path.join(PAGES_DIR, `${name}.md`));
}

export function getProjectsLastmod() {
  const dates = [getPageLastmod('projects'), ...listMarkdownFiles(PROJECTS_DIR).map(resolveMarkdownLastmod)];
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export function getResourcesLastmod() {
  const gitDates = getGitDates(RESOURCES_FILE);
  return gitDates?.updated ? new Date(gitDates.updated) : new Date();
}
