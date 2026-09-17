import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'acorn';
import { load as loadYaml } from 'js-yaml';

const CONFIG_FILE = 'webdeck.config.yaml';
const SUBMODULE_SCRIPT = 'public/webdeck-player/script.js';
const CONFIG_VARS = ['myPlaylists', 'currentPlaylist', 'myThemes', 'currentTheme'];

function findConfigVarRanges(source) {
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'script' });
  const ranges = {};

  for (const node of ast.body) {
    if (node.type !== 'VariableDeclaration') continue;
    for (const decl of node.declarations) {
      if (decl.id.type === 'Identifier' && CONFIG_VARS.includes(decl.id.name) && decl.init) {
        ranges[decl.id.name] = [decl.init.start, decl.init.end];
      }
    }
  }

  const missing = CONFIG_VARS.filter((name) => !ranges[name]);
  if (missing.length > 0) {
    throw new Error(
      `webdeck-config: ${SUBMODULE_SCRIPT} no longer declares ${missing.join(', ')} the way this plugin expects; the submodule may have updated its format, check src/plugins/webdeck-config.mjs`,
    );
  }
  return ranges;
}

function jsObjectLiteral(entries) {
  const body = entries.map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`).join('\n');
  return `{\n${body}\n}`;
}

export function buildWebdeckScript(root) {
  const config = loadYaml(readFileSync(path.join(root, CONFIG_FILE), 'utf-8'));
  const source = readFileSync(path.join(root, SUBMODULE_SCRIPT), 'utf-8');
  const ranges = findConfigVarRanges(source);

  const replacements = {
    myPlaylists: jsObjectLiteral(config.playlists.map((p) => [p.name, p.id])),
    currentPlaylist: JSON.stringify(config.initialPlaylist),
    myThemes: jsObjectLiteral(config.themes.map((t) => [t.name, t.folder])),
    currentTheme: JSON.stringify(config.initialTheme),
  };

  // splice back to front so earlier offsets in `source` stay valid as we go
  const order = [...CONFIG_VARS].sort((a, b) => ranges[b][0] - ranges[a][0]);
  let out = source;
  for (const name of order) {
    const [start, end] = ranges[name];
    out = out.slice(0, start) + replacements[name] + out.slice(end);
  }
  return out;
}

export function webdeckConfig() {
  return {
    name: 'webdeck-config',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/webdeck-player/script.js') return next();
          try {
            res.setHeader('Content-Type', 'application/javascript');
            res.end(buildWebdeckScript(process.cwd()));
          } catch (error) {
            next(error);
          }
        });
      },
      'astro:build:done': ({ dir, logger }) => {
        const outRoot = path.normalize(new URL(dir).pathname.replace(/^\/([a-z]:)/i, '$1'));
        writeFileSync(path.join(outRoot, 'webdeck-player/script.js'), buildWebdeckScript(process.cwd()));
        logger.info('generated webdeck-player/script.js from webdeck.config.yaml');
      },
    },
  };
}
