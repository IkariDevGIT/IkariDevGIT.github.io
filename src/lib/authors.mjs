import { readFileSync } from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';

export const DEFAULT_AUTHOR_ID = 'ikaridev';

const REGISTRY_FILE = path.join(process.cwd(), 'src/data/authors.yaml');

/**
 * @typedef {object} AuthorLink
 * @property {string} label
 * @property {string} href
 */

/**
 * @typedef {object} Author
 * @property {string} id
 * @property {string} name
 * @property {string} [url]
 * @property {AuthorLink[]} links
 */

/** @returns {Map<string, Author>} */
export function getAuthorRegistry() {
  const data = loadYaml(readFileSync(REGISTRY_FILE, 'utf-8')) ?? {};
  const registry = new Map();

  for (const [id, entry] of Object.entries(data)) {
    if (!entry?.name) throw new Error(`src/data/authors.yaml: "${id}" needs a name`);
    const links = entry.links ?? [];
    for (const link of links) {
      if (!link?.label || !link?.href) throw new Error(`src/data/authors.yaml: every link of "${id}" needs a label and an href`);
    }
    registry.set(id, { id, name: entry.name, url: entry.url, links });
  }

  if (!registry.has(DEFAULT_AUTHOR_ID)) {
    throw new Error(`src/data/authors.yaml: the default author "${DEFAULT_AUTHOR_ID}" is missing`);
  }
  return registry;
}

/**
 * @param {string[] | undefined} ids
 * @param {string} source
 * @returns {Author[]}
 */
export function resolveAuthors(ids, source) {
  const registry = getAuthorRegistry();
  return (ids?.length ? ids : [DEFAULT_AUTHOR_ID]).map((id) => {
    const author = registry.get(id);
    if (!author) throw new Error(`${source} lists an unknown author "${id}", add them to src/data/authors.yaml`);
    return author;
  });
}
