import { visit } from 'unist-util-visit';
import { fromHtml } from 'hast-util-from-html';
import { readPost } from '../lib/contentFiles.mjs';
import { postCardHtml } from '../lib/postCard.mjs';

function slugOf(node) {
  let out = '';
  visit(node, 'text', (child) => {
    out += child.value;
  });
  return out.trim();
}

export function rehypePostEmbed() {
  return (tree, file) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'postembed') return;

      const slug = slugOf(node);
      const post = readPost(slug);
      if (!post) {
        throw new Error(`<postembed> in ${file.history[0] ?? 'markdown'} points at a missing post: ${slug}`);
      }

      const list = {
        type: 'element',
        tagName: 'ul',
        properties: { className: ['post-list', 'post-embed'] },
        children: fromHtml(postCardHtml({ ...post, isEmbed: true }), { fragment: true }).children,
      };

      const onlyChild = parent?.tagName === 'p' && parent.children.length === 1;
      if (onlyChild) Object.assign(parent, list);
      else parent.children[index] = list;
    });
  };
}
