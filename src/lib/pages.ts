/**
 * The markdown pages in content/pages/. Each file's frontmatter carries its
 * `title` and `description`; its address is the file name slugified
 * ("About.md" → /about). A page without a description of at least 20
 * characters stops the build: every page needs one for search engines.
 */
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { slugify } from './slug';

type MarkdownModule = {
  Content: AstroComponentFactory;
  frontmatter: Record<string, unknown>;
};

export interface Page {
  slug: string;
  title: string;
  description: string;
  Content: AstroComponentFactory;
}

const files = import.meta.glob<MarkdownModule>('/content/pages/*.md', { eager: true });

export const pages: Page[] = Object.entries(files)
  .map(([path, mod]) => {
    const name = path.split('/').pop()!.replace(/\.md$/, '');
    const title = typeof mod.frontmatter.title === 'string' && mod.frontmatter.title.trim() ? mod.frontmatter.title : name;
    const description = typeof mod.frontmatter.description === 'string' ? mod.frontmatter.description.trim() : '';
    if (description.length < 20) throw new Error(`${path}: add a description of at least 20 characters to the frontmatter`);
    return { slug: slugify(name), title, description, Content: mod.Content };
  })
  .sort((a, b) => a.title.localeCompare(b.title));
