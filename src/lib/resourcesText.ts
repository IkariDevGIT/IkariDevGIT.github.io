import { getEntry, type CollectionEntry } from 'astro:content';
import type { ResourceGroup } from '../content.config';

export function resourceListUrl(id: string): string {
  return id === 'main' ? '/resources/' : `/resources/${id}/`;
}

export function resourceListMarkdownUrl(id: string): string {
  return id === 'main' ? '/resources.md' : `/resources/${id}.md`;
}

export async function resourceListMarkdown(list: CollectionEntry<'resources'>): Promise<Response> {
  const page = await getEntry('pages', `resources/${list.id}`);
  if (!page) return new Response('Not found', { status: 404 });

  const lines = [`# ${page.data.title}`, '', page.data.description, ''];
  for (const section of list.data.sections) {
    lines.push(resourceGroupToMarkdown(section), '');
  }
  if (page.body?.trim()) lines.push(page.body, '');

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}

export function resourceGroupToMarkdown(group: ResourceGroup, level = 2): string {
  const heading = '#'.repeat(Math.min(level, 6));
  const lines = [`${heading} ${group.title}`];

  if (group.intro) {
    lines.push('', group.intro);
  }

  if (group.links && group.links.length > 0) {
    lines.push('');
    for (const link of group.links) {
      lines.push(`- [${link.label}](${link.href})${link.note ? ` ~ ${link.note}` : ''}`);
    }
  }

  if (group.groups) {
    for (const subgroup of group.groups) {
      lines.push('', resourceGroupToMarkdown(subgroup, level + 1));
    }
  }

  return lines.join('\n');
}
