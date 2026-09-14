import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  output: 'static',
  outDir: process.env.DESIGN_PREVIEW === '1' ? './design-preview' : './dist',
  site: process.env.SITE_URL || 'https://ergysshehu.com',
  integrations: [sitemap()]
});
