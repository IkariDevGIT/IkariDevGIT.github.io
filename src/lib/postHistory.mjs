import { execFileSync } from 'node:child_process';
import { REPO_URL } from './buildInfo.mjs';

const SEP = '';

export const OLD_SITE_TREE_URL = `${REPO_URL}/tree/db0083b`;

function git(args) {
  return execFileSync('git', args, { encoding: 'utf-8' }).trim();
}

export function getHeadCommit() {
  try {
    return git(['rev-parse', '--short', 'HEAD']);
  } catch {
    return null;
  }
}

export function getPostHistory(slug) {
  const file = `src/content/blog/${slug}.md`;

  let output;
  try {
    output = git(['log', '--follow', `--format=%h${SEP}%cI${SEP}%s`, '--numstat', '--', file]);
  } catch {
    return [];
  }
  if (!output) return [];

  const commits = [];
  for (const line of output.split('\n')) {
    if (line.includes(SEP)) {
      const [hash, date, subject] = line.split(SEP);
      commits.push({ hash, date: new Date(date), subject, added: 0, deleted: 0, url: `${REPO_URL}/commit/${hash}` });
      continue;
    }

    const stat = line.trim().match(/^(\d+|-)\t(\d+|-)\t/);
    if (stat && commits.length) {
      const current = commits[commits.length - 1];
      current.added += Number(stat[1]) || 0;
      current.deleted += Number(stat[2]) || 0;
    }
  }

  return commits;
}
