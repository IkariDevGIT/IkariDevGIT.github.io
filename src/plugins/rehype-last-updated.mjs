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
        `<time id="last-updated-at" datetime="${committedAt.toISOString()}">${formatPostDate(committedAt)}</time>`,
        '<span id="last-updated-ago" class="last-updated-ago"></span>',
        '</p>',
        '</div>',
      ].join('');

      console.log("[dbg] children:", (node.children??[]).length, JSON.stringify((node.children??[]).map(c=>c.tagName||c.type)).slice(0,200));
      const block = fromHtml(html, { fragment: true }).children[0];
      parent.children.splice(index, 1, block, ...(node.children ?? []));
    });
  };
}
