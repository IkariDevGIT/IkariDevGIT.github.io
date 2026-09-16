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
import {
  getBlogPostLastmods,
  getPageLastmod,
  getProjectsLastmod,
  getResourcesLastmod,
  getNsfwPostSlugs,
  getUnlistedPostSlugs,
} from './src/lib/contentFiles.mjs';

// computed once here, looked up per url in serialize() below
const blogLastmods = getBlogPostLastmods();
const newestPostDate = [...blogLastmods.values()].sort((a, b) => b - a)[0] ?? new Date();
const homeLastmod = new Date(Math.max(getPageLastmod('home').getTime(), newestPostDate.getTime()));
const hiddenFromSitemap = new Set([...getNsfwPostSlugs(), ...getUnlistedPostSlugs()]);

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
    sitemap({
      filter: (page) => {
        // duplicates /blog/ under different sort/pagination urls, also noindex on the pages themselves
        if (page.includes('/blog-nojs/')) return false;
        const pathname = new URL(page).pathname;

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
          item.lastmod = getResourcesLastmod().toISOString();
        } else if (pathname === '/blog/') {
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
            content: { type: 'text', value: '#' },
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
