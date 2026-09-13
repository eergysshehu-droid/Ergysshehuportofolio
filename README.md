# Ergys Shehu Portfolio

Astro photography portfolio, Sanity CMS structure and a local preview. No domain was purchased or paid service enabled.

## Current design and content

The current design puts the supplied photography first: full-screen dance image, the supplied logo, a large serif name, a masonry project grid with category filters, an artist section, and contact details. The supplied references informed the project-index structure; the exact Wix font could not be verified.

Imported from the user's Website photos folder: 159 image files, 142 distinct file hashes, 130 selected photographs in 16 collections, plus the logo. Original files were not modified. Identical copies and obvious alternative exports/logo mockups were omitted. WebP derivatives at 480, 1000 and 1800 pixels total approximately 52 MB; responsive loading selects a suitable size instead of downloading all variants.

Named collections use supplied folder names. Other collection titles and grouping are editorial selections to review, not verified client or campaign names. Biographical claims and contact information were supplied by the user. English and Albanian full biographies appear at /about/.

The film page is ready for video projects, but no video files or showreel links were supplied.

## Run locally

Use Node 22.12 or later and npm ci.

- node scripts/build-design.mjs: local content preview in design-preview.
- node scripts/preview-design.mjs: preview at http://127.0.0.1:4322.
- npm run check: Astro and TypeScript checks.
- npm run dev: website with live Sanity access.
- npm run studio: Sanity Studio on localhost:3333.
- npm run build: production build in dist, requiring Sanity access.
- npm run studio:build: standalone editor in studio-dist.

DESIGN_PREVIEW=1 uses the imported local catalog and is rejected on Cloudflare Pages. It does not read live CMS content. The local and production output directories are separate.

## Content and CMS

Existing project: 46mghxoy / production. Configuration is in .env.example. No credentials are committed.

src/data/local-portfolio.json is the imported baseline. Normal production builds merge published Sanity content into this baseline by slug; Sanity values override the matching local project. API failures fail the production build. The local photos have not yet been uploaded to Sanity.

The CMS supports: category, project section, cover, ordered photos, alt text, captions, credits, featured status, HTTPS video URL, hero/category covers, showreel URL, short bio, full English/Albanian biographies, and artist quote. Existing document types and singleton IDs are preserved.

To migrate the local collection after Sanity login:

    npx sanity exec scripts/import-sanity.mjs --with-user-token

This uploads optimized images and creates missing draft projects/settings. It preserves existing documents with the same deterministic IDs and does not publish. Review titles, grouping, descriptions and credits in Studio before publishing. After the complete migration, remove the local baseline merge so deletions in Sanity also remove projects from the site. Until then the baseline intentionally keeps the locally imported projects visible.

## Cloudflare

GitHub repository: eergysshehu-droid/Ergysshehuportofolio.
Create a Free Cloudflare Pages project connected to that repository. Root: repository root. Build: npm run build. Output: dist. Node: 22. Project/dataset default to the verified Sanity project; environment variables can override them.

For a private dataset use SANITY_API_READ_TOKEN as a secret, never PUBLIC_ or SANITY_STUDIO_. Set the required values separately for Preview and Production. Do not deploy design-preview as the CMS-connected production website.

Cloudflare gives a pages.dev address and branch preview URLs after successful deployment. No live Cloudflare URL has been verified yet. A Sanity publish webhook can trigger a Cloudflare deploy hook to rebuild static pages. Keep hook URLs secret.

Preview indexing is disabled with robots.txt, a meta tag and a response header. Remove all three controls and set SITE_URL only when the site is ready for indexing.

## Checks and remaining work

The local preview builds 24 pages and passes Astro checks. Review the visual composition and category assignments with the photographer. Live Sanity upload, Cloudflare authentication/deployment and custom domain setup remain outstanding. Instagram and Google Drive are not live feeds.

Official references:
- https://docs.astro.build/en/guides/cms/sanity/
- https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- https://www.sanity.io/docs/studio/environment-variables
