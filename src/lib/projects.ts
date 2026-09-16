import { getCollection, render, type CollectionEntry } from 'astro:content';
import { resolvePostDates } from './postDates';

export type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  'on hold': 'On hold',
  finished: 'Finished',
  archived: 'Archived',
  legacy: 'Legacy',
};

export interface StartedDate {
  sortDate: Date;
  label: string;
  datetime: string;
}

const STARTED_FORMATS = [
  { year: 'numeric' },
  { year: 'numeric', month: 'long' },
  { year: 'numeric', month: 'long', day: 'numeric' },
].map((options) => new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' } as Intl.DateTimeFormatOptions));

export function parseStarted(value: string): StartedDate {
  const quarter = value.match(/^(\d{4})-Q([1-4])$/);
  if (quarter) {
    const [, year, q] = quarter;
    return { sortDate: new Date(Date.UTC(+year, (+q - 1) * 3)), label: `Q${q} ${year}`, datetime: year };
  }
  const sortDate = new Date(value);
  return { sortDate, label: STARTED_FORMATS[value.split('-').length - 1].format(sortDate), datetime: value };
}

export interface Project {
  entry: CollectionEntry<'projects'>;
  addedDate: Date;
  started?: StartedDate;
}

// pinned first by highest priority, then everything by newest added
function byPinnedThenAdded(a: Project, b: Project): number {
  const aPinned = a.entry.data.pinned ?? -Infinity;
  const bPinned = b.entry.data.pinned ?? -Infinity;
  if (aPinned !== bPinned) return bPinned - aPinned;
  return b.addedDate.getTime() - a.addedDate.getTime();
}

export async function getProjects(): Promise<{ current: Project[]; legacy: Project[] }> {
  const entries = await getCollection('projects');
  const projects = await Promise.all(
    entries.map(async (entry) => {
      const { remarkPluginFrontmatter } = await render(entry);
      const { pubDate } = resolvePostDates({}, remarkPluginFrontmatter);
      return {
        entry,
        addedDate: pubDate,
        started: entry.data.started ? parseStarted(entry.data.started) : undefined,
      };
    }),
  );
  projects.sort(byPinnedThenAdded);
  return {
    current: projects.filter((p) => p.entry.data.status !== 'legacy'),
    legacy: projects.filter((p) => p.entry.data.status === 'legacy'),
  };
}

export const LEGACY_PROJECTS_NOTICE =
  "These projects wont be updated as of 15 September 2026. They're mostly outdated and only kept around for the history.";

function projectToMarkdown({ entry, addedDate, started }: Project, level: number): string {
  const lines = [`${'#'.repeat(level)} ${entry.data.title}`, '', `Status: ${STATUS_LABELS[entry.data.status]}`];
  if (started) lines.push(`Project started: ${started.label}`);
  lines.push(`Added to site: ${addedDate.toISOString()}`, '', (entry.body ?? '').trim(), '');
  return lines.join('\n');
}

export async function projectsToMarkdown(level = 2): Promise<string> {
  const { current, legacy } = await getProjects();
  const out = current.map((p) => projectToMarkdown(p, level));
  if (legacy.length) {
    out.push(`${'#'.repeat(level)} Legacy projects`, '', LEGACY_PROJECTS_NOTICE, '');
    out.push(...legacy.map((p) => projectToMarkdown(p, level + 1)));
  }
  return out.join('\n');
}
