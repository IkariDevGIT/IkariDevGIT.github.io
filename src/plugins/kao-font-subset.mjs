import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import subsetFont from 'subset-font';

const SOURCES = ['MPLUSRounded1c-Regular.ttf', 'NotoSansJP-Regular.ttf'];
const CACHE = path.join(process.cwd(), '.astro/kao-chars.json');

export function kaoFontSubset(chars) {
  return {
    name: 'kao-font-subset',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const name = SOURCES.find((source) => req.url === `/fonts/${source}`);
          if (!name) return next();
          res.setHeader('Content-Type', 'font/ttf');
          res.end(readFileSync(path.join(process.cwd(), 'src/assets/fonts', name)));
        });
      },
      'astro:build:done': async ({ dir, logger }) => {
        const known = new Set(chars);
        if (existsSync(CACHE)) {
          for (const char of JSON.parse(readFileSync(CACHE, 'utf-8'))) known.add(char);
        }
        if (known.size) writeFileSync(CACHE, JSON.stringify([...known]));

        const text = [...known].join('');
        if (!text) {
          logger.warn('no <kao> characters found, skipping font subset');
          return;
        }

        const fontDir = path.join(process.cwd(), 'src/assets/fonts');
        const outDir = path.join(new URL(dir).pathname.replace(/^\/([a-z]:)/i, '$1'), 'fonts');
        mkdirSync(outDir, { recursive: true });

        for (const source of SOURCES) {
          const buffer = await subsetFont(readFileSync(path.join(fontDir, source)), text, { targetFormat: 'woff2' });
          const name = source.replace(/-Regular\.ttf$/, '-kao.woff2');
          writeFileSync(path.join(outDir, name), buffer);
          logger.info(`${name}: ${(buffer.length / 1024).toFixed(1)} kB for ${known.size} characters`);
        }
      },
    },
  };
}
