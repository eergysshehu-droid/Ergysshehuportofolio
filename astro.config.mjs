import { defineConfig } from 'astro/config';
export default defineConfig({ output: 'static', outDir: process.env.DESIGN_PREVIEW === '1' ? './design-preview' : './dist', site: process.env.SITE_URL || undefined });
