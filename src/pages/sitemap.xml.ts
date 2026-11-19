import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { pages } from '../lib/pages';

/** Every page that belongs in search: the home page, the contact page and each markdown page. */
export const GET: APIRoute = () => {
  const paths = ['/', '/contact', ...pages.map((page) => `/${page.slug}`)];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, SITE.url).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
