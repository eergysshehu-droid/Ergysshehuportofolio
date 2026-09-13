# Ergys Shehu Portfolio

## V2 design review

The homepage now follows the user-supplied `ergys-shehu-portfolio-v2.zip`: dark editorial layout, large serif headline, three photography categories, film banner and ivory About/Contact panels. Its supplied biography, email and Instagram are defaults overridden by Sanity. The ZIP contains no photographs or videos; the original gradient placeholders remain until real media is supplied.

`node scripts/build-design.mjs` creates an explicitly offline, empty-content design review in `design-preview`, separate from the production output. Use `node scripts/preview-design.mjs` to view it locally at http://127.0.0.1:4322. Normal `npm run build` still requires successful Sanity access. Never deploy `design-preview` as the finished portfolio.

New CMS fields include homepage covers, hero image, introduction, About heading, showreel URL, project section, featured projects, video URL and credits. Category pages: `/fashion/`, `/weddings/`, `/portraits/`, `/films/`; `/projects/` lists all published projects. Video links open the supplied HTTPS video URL without automatically loading third-party embeds. For film projects, either photos or a video URL is required. Existing album and settings document types and IDs are preserved.

Astro static photography portfolio and a separate Sanity Studio. No domain purchase, paid plan, Worker function, database or storage subscription is configured.

## Local setup

Use Node 22.12 or later, then `npm ci`. Copy `.env.example` to `.env` and fill both project ID fields with the **existing** Sanity Project ID. Set both dataset fields to the existing dataset. Do not create or replace a dataset during setup.

- `npm run dev`: website at http://localhost:4321
- `npm run studio`: editor at http://localhost:3333 (sign in with the existing Sanity account)
- `npm run check`: Astro and TypeScript checks
- `npm run build`: static site in `dist`
- `npm run studio:build`: standalone Studio in `studio-dist`

The verified existing project `46mghxoy`, dataset `production`, is the default; environment variables can override it. An empty dataset renders an honest coming-soon page. API/authentication errors intentionally fail the build so an existing live portfolio is not replaced by an empty site. A private dataset requires a read-only `SANITY_API_READ_TOKEN` stored in local/Cloudflare environment settings, never Git. Studio variables and the project ID are public: do not put secrets in them.

## CMS

Open **Profili dhe kontakti** to edit the singleton `siteSettings`: name, headline, biography, portrait, public email, Instagram, and search description. Create categories, then albums with a title, generated slug, cover, ordered photos, location, year, and display order. Each photo supports alternative text, caption, credit, crop and hotspot. Publish documents to expose them on the website. Drafts are excluded.

Album pages are generated at `/portfolio/<slug>/`. Gallery photos open a larger version. Home page category buttons filter published albums. No sample images or invented contact details are presented as the photographer's work.

## Cloudflare Pages — Git integration

Connect `eergysshehu-droid/Ergysshehuportofolio` in Cloudflare **Workers & Pages → Create → Pages → Connect to Git**. Use the Free plan only; stop if any paid upgrade is required.

- Framework: Astro
- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- Environment: `NODE_VERSION=22`, `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`
- Optional private dataset: `SANITY_API_READ_TOKEN` as a secret

Set the same required values separately for Preview. Cloudflare assigns a free `pages.dev` URL; branch deployments receive preview URLs. Confirm the actual assigned URL from the successful deployment. Do not assume a hostname is available. Git integration must be configured in the account dashboard; a direct Wrangler upload does not create this integration.

For a one-off preview on an existing Pages project, after authentication and a successful build: `npx wrangler pages deploy dist --project-name <confirmed-project-name> --branch preview`. Check the account and existing projects before creating anything.

Sanity changes need a fresh static build. In Cloudflare Pages create a deploy hook for the desired branch. In the existing Sanity project create a webhook for create/update/delete, filtered to `_type in ["album", "category", "siteSettings"] && !(_id in path("drafts.**"))`, pointing to the deploy hook. Treat that hook URL as a secret. Publish an album and verify a new deployment and updated page. Free-plan build and CMS quotas still apply.

Studio can remain local. If hosted separately, build `studio-dist` into a separate free Pages project. Add only its exact confirmed origin to the existing Sanity project's CORS origins with credentials enabled; add `http://localhost:3333` for local editing. Do not allow credentialed wildcard origins.

## Preview privacy and launch

This setup requests no indexing using robots.txt, a robots meta tag and an X-Robots-Tag header. A public preview remains accessible to anyone with its URL. Once ready for public search indexing, remove all three noindex controls and set `SITE_URL` to the confirmed canonical URL.

## Official references

- https://docs.astro.build/en/guides/cms/sanity/
- https://www.sanity.io/docs/studio/environment-variables
- https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/deploy-hooks/
- https://developers.cloudflare.com/pages/platform/limits/
