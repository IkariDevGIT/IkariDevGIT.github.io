import { execFileSync } from 'node:child_process';

export const REPO_URL = 'https://github.com/IkariDevGIT/IkariDevGIT.github.io';

export function getBuildInfo() {
  let commit = null;
  try {
    commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf-8' }).trim();
  } catch {
    commit = null;
  }

  return {
    commit,
    commitUrl: commit ? `${REPO_URL}/commit/${commit}` : null,
    builtAt: new Date(),
  };
}
