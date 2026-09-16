import { visit } from 'unist-util-visit';

export const kaoChars = (globalThis.__kaoChars ??= new Set());

function collectChars(node) {
  if (node.type === 'text') for (const char of node.value) kaoChars.add(char);
  for (const child of node.children ?? []) collectChars(child);
}

const transforms = {
  kao(node) {
    node.tagName = 'span';
    node.properties = { ...node.properties, className: ['kaomoji'] };
    collectChars(node);
  },
  spoiler(node) {
    const children = node.children;
    node.tagName = 'label';
    node.properties = { ...node.properties, className: ['spoiler'] };
    node.children = [
      {
        type: 'element',
        tagName: 'input',
        properties: { type: 'checkbox', className: ['spoiler-toggle'] },
        children: [],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['spoiler-text'] },
        children,
      },
    ];
  },
};

export function rehypeCustomTags() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      const transform = transforms[node.tagName];
      if (transform) transform(node);
    });
  };
}
