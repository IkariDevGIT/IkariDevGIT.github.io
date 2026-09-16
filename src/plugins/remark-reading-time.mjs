import { toString } from 'mdast-util-to-string';

const WORDS_PER_MINUTE = 200;

export function remarkReadingTime() {
  return function (tree, file) {
    const text = toString(tree);
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const minutesRead = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

    file.data.astro.frontmatter.wordCount = wordCount;
    file.data.astro.frontmatter.minutesRead = minutesRead;
  };
}
