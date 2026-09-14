export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

// Server/build-time only: this module is imported from Astro frontmatter and never
// bundled for the client, so the token never reaches the browser. Do not log it.
const CACHE_URL = new URL('../../instagram-media.json', import.meta.url);
const CACHE_TTL_MS = 60 * 60 * 1000;

async function readCache(): Promise<{fetchedAt: number; items: InstagramMedia[]} | undefined> {
  try {
    const {readFile} = await import('node:fs/promises');
    return JSON.parse(await readFile(CACHE_URL, 'utf8'));
  } catch {
    return undefined;
  }
}

async function writeCache(items: InstagramMedia[]) {
  try {
    const {writeFile} = await import('node:fs/promises');
    await writeFile(CACHE_URL, JSON.stringify({fetchedAt: Date.now(), items}, null, 2));
  } catch {
    // Non-fatal: caching is a build-time convenience, not a requirement.
  }
}

let cached: Promise<InstagramMedia[]> | undefined;

// Content source only — never rendered with Instagram-style embed chrome.
// Supports IMAGE, VIDEO and CAROUSEL_ALBUM (the album preview uses its lead image).
export function instagramMedia(limit = 9): Promise<InstagramMedia[]> {
  return cached ??= (async () => {
    const token = import.meta.env.INSTAGRAM_ACCESS_TOKEN as string | undefined;
    const disk = await readCache();
    if (!token) return disk?.items ?? [];
    if (disk && Date.now() - disk.fetchedAt < CACHE_TTL_MS) return disk.items;
    try {
      const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
      const endpoint = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Instagram media request failed');
      const data = await response.json();
      const items: InstagramMedia[] = Array.isArray(data?.data) ? data.data : [];
      await writeCache(items);
      return items;
    } catch {
      return disk?.items ?? [];
    }
  })();
}
