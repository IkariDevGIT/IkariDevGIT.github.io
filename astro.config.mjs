// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import { remarkGitDates } from './src/plugins/remark-git-dates.mjs';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';
import { rehypeCustomTags } from './src/plugins/rehype-custom-tags.mjs';
import { rehypePostEmbed } from './src/plugins/rehype-post-embed.mjs';
import { kaoFontProvider } from './src/plugins/kao-font-provider.mjs';
import { rehypeLastUpdated } from './src/plugins/rehype-last-updated.mjs';
import { webdeckConfig } from './src/plugins/webdeck-config.mjs';
import {
  getBlogPostLastmods,
  getPageLastmod,
  getProjectsLastmod,
  getResourcesLastmod,
  getNsfwPostSlugs,
  getUnlistedPostSlugs,
  getEmptyRepostSlugs,
} from './src/lib/contentFiles.mjs';

// computed once here, looked up per url in serialize() below
const blogLastmods = getBlogPostLastmods();
const newestPostDate = [...blogLastmods.values()].sort((a, b) => b - a)[0] ?? new Date();
const homeLastmod = new Date(Math.max(getPageLastmod('home').getTime(), newestPostDate.getTime()));
const hiddenFromSitemap = new Set([...getNsfwPostSlugs(), ...getUnlistedPostSlugs(), ...getEmptyRepostSlugs()]);

// custom domain 301s from the github.io url once set up in repo settings, so only one url needs to be canonical
// https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
export default defineConfig({
  site: 'https://ikari.sillytilly.org',
  fonts: [
    {
      name: 'M PLUS Rounded 1c',
      cssVariable: '--font-kaomoji',
      provider: kaoFontProvider(),
      fallbacks: ['MS PGothic', 'sans-serif'],
    },
  ],
  integrations: [
    webdeckConfig(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;

        if (/^\/blog\/(oldest|latest-update)\//.test(pathname)) return false;

        if (pathname === '/webdeck/') return false;

        if (pathname.startsWith('/blog/')) {
          const slug = pathname.replace(/^\/blog\//, '').replace(/\/$/, '');
          if (hiddenFromSitemap.has(slug)) return false;
        }
        return true;
      },
      // google uses lastmod if accurate, ignores priority/changefreq entirely
      serialize(item) {
        const pathname = new URL(item.url).pathname;

        if (pathname === '/') {
          item.lastmod = homeLastmod.toISOString();
        } else if (pathname === '/about/') {
          item.lastmod = getPageLastmod('about').toISOString();
        } else if (pathname === '/projects/') {
          item.lastmod = getProjectsLastmod().toISOString();
        } else if (pathname === '/resources/') {
          item.lastmod = getResourcesLastmod('main').toISOString();
        } else if (/^\/resources\/[^/]+\/$/.test(pathname)) {
          item.lastmod = getResourcesLastmod(pathname.split('/')[2]).toISOString();
        } else if (pathname === '/blog/' || /^\/blog\/\d+\/$/.test(pathname)) {
          item.lastmod = newestPostDate.toISOString();
        } else if (pathname.startsWith('/blog/')) {
          const slug = pathname.replace(/^\/blog\//, '').replace(/\/$/, '');
          const lastmod = blogLastmods.get(slug);
          if (lastmod) item.lastmod = lastmod.toISOString();
        }

        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'css-variables', wrap: true },
    // explicit processor instead of the deprecated top-level remarkPlugins option
    // https://docs.astro.build/en/guides/markdown-content/#setting-up-a-markdown-processor
    processor: unified({
      remarkPlugins: [remarkGitDates, remarkReadingTime],
      rehypePlugins: [
        rehypeRaw,
        rehypeCustomTags,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { className: ['heading-anchor'], ariaLabel: 'Link to this section' },
            content: [],
          },
        ],
        rehypePostEmbed,
        rehypeLastUpdated,
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['noopener'],
            test: (/** @type {import('hast').Element} */ el) => {
              const href = el.properties?.href;
              if (typeof href !== 'string') return false;
              try {
                return new URL(href, 'https://ikari.sillytilly.org').hostname !== 'ikari.sillytilly.org';
              } catch {
                return false;
              }
            },
          },
        ],
      ],
    }),
  },
});
