import path from 'node:path';
import { readFileSync } from 'node:fs';
import type { CollectionEntry } from 'astro:content';
import type { ResourceGroup, ResourceLink } from '../content.config';
import { getLineDates } from './gitDates.mjs';

export const RESOURCE_STATUS_LABEL = 'Inactive';

export interface ResolvedLink extends ResourceLink {
  addedDate: Date | null;
}

export interface ResolvedGroup {
  id: string;
  title: string;
  intro?: string;
  links?: ResolvedLink[];
  groups?: ResolvedGroup[];
}

function addedDatesByHref(id: string): Map<string, Date> {
  const file = path.join(process.cwd(), 'src/content/resources', `${id}.yaml`);
  const lineDates = getLineDates(file);
  const byHref = new Map<string, Date>();

  readFileSync(file, 'utf-8')
    .split(/\r?\n/)
    .forEach((row, index) => {
      const href = row.match(/^\s*href:\s*(\S+)/)?.[1]?.replace(/^["']|["']$/g, '');
      const date = lineDates.get(index + 1);
      if (href && date && !byHref.has(href)) byHref.set(href, date);
    });

  return byHref;
}

function resolveGroup(group: ResourceGroup, added: Map<string, Date>, defaultStatus?: string): ResolvedGroup {
  return {
    ...group,
    links: group.links
      ?.map((link) => ({
        ...link,
        status: link.status ?? defaultStatus,
        addedDate: added.get(link.href) ?? null,
      }))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite)),
    groups: group.groups?.map((child) => resolveGroup(child, added, defaultStatus)),
  };
}

export function resolveResourceList(list: CollectionEntry<'resources'>): ResolvedGroup[] {
  const added = addedDatesByHref(list.id);
  return list.data.sections.map((section) => resolveGroup(section, added, list.data.defaultStatus));
}
