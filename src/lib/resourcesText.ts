import type { ResourceGroup } from '../content.config';

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
