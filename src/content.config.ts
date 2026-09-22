import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // dates default to git history (see remark-git-dates.mjs + postDates.ts),
      // set these to override, needed for posts migrated from the old site
      pubDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      unlisted: z.boolean().default(false),
      repost: z.url().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['active', 'on hold', 'finished', 'archived', 'legacy']),
    started: z
      .preprocess(
        (value) =>
          value instanceof Date ? value.toISOString().slice(0, 10) : typeof value === 'number' ? String(value) : value,
        z.string().regex(/^\d{4}(-Q[1-4]|-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/, 'use YYYY, YYYY-QN, YYYY-MM or YYYY-MM-DD'),
      )
      .optional(),
    lastUpdate: z.url().optional(),
    pinned: z.number().optional(),
  }),
});

const resourceLinkSchema = z.object({
  label: z.string(),
  href: z.url(),
  note: z.string().optional(),
});

export interface ResourceGroup {
  id: string;
  title: string;
  intro?: string;
  links?: z.infer<typeof resourceLinkSchema>[];
  groups?: ResourceGroup[];
}

const resourceGroupSchema: z.ZodType<ResourceGroup> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    intro: z.string().optional(),
    links: z.array(resourceLinkSchema).optional(),
    groups: z.array(resourceGroupSchema).optional(),
  }),
);

const resources = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/resources' }),
  schema: z.object({
    sections: z.array(resourceGroupSchema),
  }),
});

export const collections = { blog, pages, projects, resources };
