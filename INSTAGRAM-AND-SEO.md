# Instagram and search setup

The live origin is https://ergysshehu.com. Production builds now generate canonical URLs, social preview metadata, homepage Person/WebSite structured data and sitemap.xml. robots.txt points to the sitemap. Local design previews retain noindex; production pages do not. A sitemap does not guarantee Google indexing. The owner should submit https://ergysshehu.com/sitemap.xml in Google Search Console and inspect the homepage URL for the current crawl/index status.

Instagram, Facebook and YouTube profile URLs were extracted from the user's public Wix page. Their icons appear in the footer/contact section and URLs can be edited in Sanity. LinkedIn is supported but hidden until its correct URL is supplied.

## Collect Instagram for visual review

Keep the existing .env entries. Add INSTAGRAM_ACCESS_TOKEN with the valid token for the Instagram Login API used in the user's example. Never use a PUBLIC_ or SANITY_STUDIO_ prefix and never commit or paste the token into source files. If it was only in a closed PowerShell session, obtain a new valid token through the existing Meta setup.

Run from the repository root:

    node scripts/instagram-sync.mjs

The script retrieves up to four pages of 25 posts and expands carousel children. It downloads review thumbnails into the ignored .instagram-import folder. The ignored index contains captions, timestamps, permalinks and temporary media URLs, but no access token. It records whether more pages are available. This bounded batch is not an export of the complete account.

Review the thumbnails and captions before assigning categories. Do not infer wedding clients or brand credits from generic appearances alone. Add selected entries to instagram-selection.json:

    [{"id":"THE_MEDIA_ID","category":"fashion","title":"Confirmed project title","alt":"Description of the photograph","featured":false}]

Categories: fashion, weddings, portraits, films, projects. Reels can belong to weddings/fashion and also appear in Motion. Then run:

    node scripts/instagram-sync.mjs --publish

Despite the flag name, this only imports reviewed media into the local project; it does not push GitHub or publish externally. It saves WebP images and MP4 files, then merges reviewed projects by stable source ID into src/data/instagram-portfolio.json. Existing imports are preserved. Originals remain on Instagram. Download limits are 25 MB for images and 80 MB for a video; larger films should use a suitable video host. If a CDN link has expired, collect again. Tokens are sent only to the Graph API, never to media hosts or the browser.

The site displays imported items in the existing project categories, in the recent Instagram section and, for videos, in Motion. Videos have visible playback controls and do not autoplay. Without imported items the recent section is hidden. Rebuild and deploy after each import; this static workflow is not an automatic live Instagram feed.

No new Instagram media was fetched during setup because the token had not yet been saved. API authentication and actual media processing need to be verified with that token. Neither the Instagram token nor Cloudflare account access is needed for the sitemap/social-link changes.
