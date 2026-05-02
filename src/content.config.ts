import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    description: z.string().default(''),
  }),
});

const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    github: z.string().url().optional().or(z.literal('')),
    demo: z.string().url().optional().or(z.literal('')),
    featured: z.boolean().default(false),
  }),
});

const aboutCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string().default('dalong'),
    tagline: z.string().default('Your Tagline'),
    avatar: z.string().default('/avatar.png'),
  }),
});

export const collections = {
  about: aboutCollection,
  blog: blogCollection,
  projects: projectCollection,
};
