import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/data/site';

export default defineConfig({
  site: SITE.url,
  output: 'static',
  // Pages are built as files (about.html) and served without a trailing slash
  // (/about). Cloudflare redirects /about/ to /about, so each page has exactly
  // one address.
  trailingSlash: 'never',
  build: { format: 'file' },
  vite: {
    plugins: [tailwindcss()],
  },
});
