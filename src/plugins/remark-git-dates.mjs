import { getGitDates } from '../lib/gitDates.mjs';

const isPost = (filepath) => /[\\/]content[\\/]blog[\\/]/.test(filepath);

export function remarkGitDates() {
  return function (_tree, file) {
    const filepath = file.history[0];
    const gitDates = filepath ? getGitDates(filepath, { bodyOnly: isPost(filepath) }) : null;

    file.data.astro.frontmatter.gitCreated = gitDates?.created ?? null;
    file.data.astro.frontmatter.gitUpdated = gitDates?.updated ?? null;
  };
}
