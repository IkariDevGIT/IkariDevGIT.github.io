import { execFileSync } from 'node:child_process';

// git log for one file, newest first. null if no history yet or git unavailable.
// CI needs fetch-depth: 0 (not the default shallow clone) or every file's
// "created" date collapses to the same single commit
export function getGitDates(filepath) {
  try {
    const output = execFileSync(
      'git',
      ['log', '--follow', '--format=%cI', '--', filepath],
      { encoding: 'utf-8' },
    ).trim();

    if (!output) return null;

    const dates = output.split('\n');
    return {
      updated: dates[0],
      created: dates[dates.length - 1],
    };
  } catch {
    return null;
  }
}
