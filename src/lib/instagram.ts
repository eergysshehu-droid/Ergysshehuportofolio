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

async function cachePath(): Promise<string> {
  const path = await import('node:path');
  return path.join(process.cwd(), 'instagram-media.json');
}

const CACHE_TTL_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;

async function readCache(): Promise<{ fetchedAt: number; items: InstagramMedia[] } | undefined> {
  try {
    const { readFile } = await import('node:fs/promises');
    const value = JSON.parse(await readFile(await cachePath(), 'utf8'));
    if (!value || !Array.isArray(value.items) || typeof value.fetchedAt !== 'number') return undefined;
    return value;
  } catch {
    return undefined;
  }
}

async function writeCache(items: InstagramMedia[]) {
  try {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(await cachePath(), JSON.stringify({ fetchedAt: Date.now(), items }, null, 2));
  } catch {}
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

function toUsable(items: InstagramMedia[]): UsableInstagramMedia[] {
  return items
    .map(item => ({
      ...item,
      cover: item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url,
    }))
    .filter((item): item is UsableInstagramMedia =>
      isValidHttpUrl(item.cover) && isValidHttpUrl(item.permalink)
    );
}

let cached: Promise<UsableInstagramMedia[]> | undefined;

export function instagramMedia(limit = 24): Promise<UsableInstagramMedia[]> {
  return cached ??= (async () => {
    const token = (
      import.meta.env.INSTAGRAM_ACCESS_TOKEN ||
      process.env.INSTAGRAM_ACCESS_TOKEN
    ) as string | undefined;

    const disk = await readCache();
    let raw: InstagramMedia[];

    if (!token || (disk && Date.now() - disk.fetchedAt < CACHE_TTL_MS)) {
      raw = disk?.items ?? [];
    } else {
      try {
        const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
        const endpoint = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
        const response = await fetch(endpoint, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

        if (!response.ok) throw new Error(`Instagram media request failed: ${response.status}`);

        const data = await response.json();
        raw = Array.isArray(data?.data) ? data.data : [];
        await writeCache(raw);
      } catch {
        raw = disk?.items ?? [];
      }
    }

    return toUsable(raw);
  })();
}
