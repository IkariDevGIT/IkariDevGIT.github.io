import { visit } from 'unist-util-visit';
import { fromHtml } from 'hast-util-from-html';
import { getBuildInfo } from '../lib/buildInfo.mjs';
import { formatPostDate } from '../lib/dateFormat.mjs';

export function rehypeLastUpdated() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'lastupdated') return;

      const { committedAt } = getBuildInfo();
      const html = [
        '<div class="last-updated box2">',
        '<p class="box">',
        '<span class="last-updated-label">Website last updated at</span>',
        `<time datetime="${committedAt.toISOString()}">${formatPostDate(committedAt)}</time>`,
        `<span class="last-updated-ago" data-ago="${committedAt.toISOString()}"></span>`,
        '</p>',
        '</div>',
      ].join('');

      const block = fromHtml(html, { fragment: true }).children[0];
      parent.children.splice(index, 1, block, ...(node.children ?? []));
    });
  };
}
