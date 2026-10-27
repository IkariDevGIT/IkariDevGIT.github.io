import { readFileSync } from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';

const REGISTRY_FILE = path.join(process.cwd(), 'src/data/tags.yaml');

export const tagUrl = (tag) => `/blog/tag/${encodeURIComponent(tag)}/`;

/**
 * @param {string} tag
 * @returns {{ title: string, description: string }}
 */
export function tagInfo(tag) {
  const entry = (loadYaml(readFileSync(REGISTRY_FILE, 'utf-8')) ?? {})[tag] ?? {};
  return {
    title: entry.title ?? `Posts tagged ${tag}`,
    description: entry.description ?? `Every blog post tagged ${tag}, newest first.`,
  };
}
