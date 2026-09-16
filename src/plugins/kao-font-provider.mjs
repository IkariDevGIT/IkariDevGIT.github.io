import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import matter from 'gray-matter';
import subsetFont from 'subset-font';
import { rehypeCustomTags, kaoChars } from './rehype-custom-tags.mjs';

const SOURCE = 'src/assets/fonts/MPLUSRounded1c-Regular.ttf';

function listMarkdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdownFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

async function collectKaoChars(root) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeCustomTags);

  for (const file of listMarkdownFiles(path.join(root, 'src/content'))) {
    const { content } = matter(readFileSync(file, 'utf-8'));
    await processor.run(processor.parse(content));
  }
  return [...kaoChars].join('');
}

export function kaoFontProvider() {
  let url;

  return {
    name: 'kao-subset',
    async init(context) {
      const root = fileURLToPath(context?.root ?? new URL('../../', import.meta.url));
      const text = await collectKaoChars(root);
      const buffer = await subsetFont(readFileSync(path.join(root, SOURCE)), text || ' ', {
        targetFormat: 'woff2',
      });

      const outDir = path.join(root, 'node_modules/.astro/kao-font');
      mkdirSync(outDir, { recursive: true });
      url = path.join(outDir, 'kaomoji.woff2');
      writeFileSync(url, buffer);
    },
    async resolveFont() {
      return { fonts: [{ src: [{ url }], weight: 400, style: 'normal' }] };
    },
  };
}
