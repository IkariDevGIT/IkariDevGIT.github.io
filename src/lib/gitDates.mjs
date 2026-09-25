import { execFileSync } from 'node:child_process';

const bodyOf = (text) => text.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();

function bodyAt(rev, filepath) {
  try {
    const text = execFileSync('git', ['show', `${rev}:${filepath}`], { encoding: 'utf-8', maxBuffer: 16 * 1024 * 1024 });
    return bodyOf(text);
  } catch {
    return null;
  }
}

function lastBodyChange(filepath) {
  const output = execFileSync(
    'git',
    ['-c', 'core.quotepath=false', 'log', '--follow', '--name-status', '--format=%x00%H %cI', '--', filepath],
    { encoding: 'utf-8' },
  );

  for (const chunk of output.split('\0').slice(1)) {
    const [header, statusLine] = chunk.split('\n').filter(Boolean);
    if (!statusLine) continue;

    const [hash, date] = header.split(' ');
    const [status, ...paths] = statusLine.split('\t');
    if (status.startsWith('A')) return date;

    const after = bodyAt(hash, paths[paths.length - 1]);
    const before = bodyAt(`${hash}^`, paths[0]);
    if (after === null || before === null || after !== before) return date;
  }
  return null;
}

// git log for one file, newest first. null if no history yet or git unavailable.
// CI needs fetch-depth: 0 (not the default shallow clone) or every file's
// "created" date collapses to the same single commit
export function getGitDates(filepath, { bodyOnly = false } = {}) {
  try {
    const output = execFileSync(
      'git',
      ['log', '--follow', '--format=%cI', '--', filepath],
      { encoding: 'utf-8' },
    ).trim();

    if (!output) return null;

    const dates = output.split('\n');
    return {
      updated: (bodyOnly && lastBodyChange(filepath)) || dates[0],
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
    output = execFileSync('git', ['blame', '--line-porcelain', '-M', '-C', '--', filepath], {
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
