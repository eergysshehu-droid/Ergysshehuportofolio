export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

export interface UsableInstagramMedia extends InstagramMedia {
  cover: string;
}

// Server/build-time only: this module is imported from Astro frontmatter and never
// bundled for the client, so the token never reaches the browser. Do not log it.
//
// The cache file lives at the project root. Deliberately resolved from process.cwd()
// (astro build always runs from the project root) rather than import.meta.url — Astro's
// static build rewrites import.meta.url for SSG-executed modules to a path relative to
// the dist/ output directory, which made the old `new URL('../../instagram-media.json',
// import.meta.url)` resolve to dist/instagram-media.json: read and write both silently
// missed the real file every build, so the on-disk cache never actually worked.
async function cachePath(): Promise<string> {
  const path = await import('node:path');
  return path.join(process.cwd(), 'instagram-media.json');
}
const CACHE_TTL_MS = 60 * 60 * 1000;

async function readCache(): Promise<{fetchedAt: number; items: InstagramMedia[]} | undefined> {
  try {
    const {readFile} = await import('node:fs/promises');
    return JSON.parse(await readFile(await cachePath(), 'utf8'));
  } catch {
    return undefined;
  }
}

async function writeCache(items: InstagramMedia[]) {
  try {
    const {writeFile} = await import('node:fs/promises');
    await writeFile(await cachePath(), JSON.stringify({fetchedAt: Date.now(), items}, null, 2));
  } catch {
    // Non-fatal: caching is a build-time convenience, not a requirement.
  }
}

function isValidHttpUrl(value?: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

// Instagram is an external, untrusted content source — a malformed item (missing/empty
// media_url, non-URL permalink) must be skipped, never crash the homepage prerender.
function toUsable(items: InstagramMedia[]): UsableInstagramMedia[] {
  return items
    .map(item => ({...item, cover: item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url}))
    .filter((item): item is UsableInstagramMedia => isValidHttpUrl(item.cover) && isValidHttpUrl(item.permalink));
}

let cached: Promise<UsableInstagramMedia[]> | undefined;

// Content source only — never rendered with Instagram-style embed chrome.
// Supports IMAGE, VIDEO and CAROUSEL_ALBUM (the album preview uses its lead image).
// Live data always takes priority when the token is present and the fetch succeeds;
// falls back to the on-disk cache, then to an empty list, never throwing.
export function instagramMedia(limit = 24): Promise<UsableInstagramMedia[]> {
  return cached ??= (async () => {
    const token = import.meta.env.INSTAGRAM_ACCESS_TOKEN as string | undefined;
    const disk = await readCache();
    let raw: InstagramMedia[];
    let source: 'LIVE' | 'FALLBACK';

    if (!token) {
      raw = disk?.items ?? [];
      source = 'FALLBACK';
    } else if (disk && Date.now() - disk.fetchedAt < CACHE_TTL_MS) {
      raw = disk.items;
      source = 'FALLBACK';
    } else {
      try {
        const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
        const endpoint = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Instagram media request failed: ' + response.status);
        const data = await response.json();
        raw = Array.isArray(data?.data) ? data.data : [];
        source = 'LIVE';
        await writeCache(raw);
      } catch {
        raw = disk?.items ?? [];
        source = 'FALLBACK';
      }
    }

    const usable = toUsable(raw);

    // TEMPORARY build-time diagnostics — never prints the token or any URL containing it.
    console.log('Instagram token present:', Boolean(token));
    console.log('Instagram raw items:', raw.length);
    console.log('Instagram usable items:', usable.length);
    console.log('Instagram source:', source);

    return usable;
  })();
}
