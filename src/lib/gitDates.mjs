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

export function getLineDates(filepath) {
  const dates = new Map();

  let output;
  try {
    output = execFileSync('git', ['blame', '--line-porcelain', '--', filepath], {
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return dates;
  }

  let time = null;
  let line = null;

  for (const row of output.split('\n')) {
    const header = row.match(/^[0-9a-f]{40}\s+\d+\s+(\d+)/);
    if (header) {
      line = Number(header[1]);
      continue;
    }
    if (row.startsWith('committer-time ')) {
      time = Number(row.slice('committer-time '.length));
      continue;
    }
    if (row.startsWith('\t') && line !== null) {
      if (time !== null) dates.set(line, new Date(time * 1000));
      time = null;
      line = null;
    }
  }

  return dates;
}
