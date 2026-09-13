import {createClient} from '@sanity/client';
import {createImageUrlBuilder} from '@sanity/image-url';
import localPortfolio from '../data/local-portfolio.json';
export interface Photo {asset?: {_ref: string}; src?: string; localBase?: string; width?: number; height?: number; alt?: string; caption?: string; credit?: string; crop?: any; hotspot?: any}
export interface Album {title: string; slug: string; description?: string; category?: string; kind?: string; featured?: boolean; videoUrl?: string; credits?: string; cover?: Photo; photos?: Photo[]; location?: string; year?: number}
export interface Settings {name?: string; headline?: string; intro?: string; aboutHeading?: string; bio?: string; biographyEn?: string; biographySq?: string; artistQuote?: string; portrait?: Photo; heroImage?: Photo; fashionCover?: Photo; weddingsCover?: Photo; portraitsCover?: Photo; filmCover?: Photo; reelUrl?: string; email?: string; instagram?: string; seoDescription?: string}
const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || '46mghxoy';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const client = projectId ? createClient({projectId, dataset, apiVersion: '2026-09-01', useCdn: false, perspective: 'published', token: import.meta.env.SANITY_API_READ_TOKEN || undefined}) : null;
let cached: Promise<{settings: Settings; albums: Album[]}> | undefined;
export function content(): Promise<{settings: Settings; albums: Album[]}> {
  if (import.meta.env.DESIGN_PREVIEW === '1') {
    if (import.meta.env.CF_PAGES) throw new Error('DESIGN_PREVIEW is only for local design review.');
    return Promise.resolve(localPortfolio);
  }
  return cached ??= (client ? client.fetch(`{
    "settings": *[_type == "siteSettings" && _id == "siteSettings"][0],
    "albums": *[_type == "album" && defined(slug.current)] | order(order asc, _createdAt desc) {title, "slug": slug.current, description, "category": category->title, kind, featured, videoUrl, credits, cover, photos, location, year}
  }`).then(data => ({settings: {...localPortfolio.settings, ...Object.fromEntries(Object.entries(data.settings || {}).filter(([,v]) => v != null))}, albums: [...new Map([...localPortfolio.albums, ...(data.albums || [])].map(a => [a.slug,a])).values()]})) : Promise.resolve(localPortfolio));
}
export function photoUrl(photo: Photo | undefined, width = 1400) {
  if (photo?.localBase) return `${photo.localBase}-${width <= 480 ? 480 : width <= 1000 ? 1000 : 1800}.webp`;
  if (photo?.src) return photo.src;
  if (!client || !photo?.asset?._ref) return undefined;
  return createImageUrlBuilder(client).image(photo).width(width).fit('max').auto('format').quality(85).url();
}
export function albumKind(album: Album) {
  if (album.kind) return album.kind;
  const category = album.category?.toLowerCase() || '';
  if (/wedding/.test(category)) return 'weddings';
  if (/portrait/.test(category)) return 'portraits';
  if (/film|video|music/.test(category)) return 'films';
  if (/fashion|editorial/.test(category)) return 'fashion';
  return 'projects';
}
export function safeUrl(value?: string) {
  try { const url = new URL(value || ''); return url.protocol === 'https:' ? url.href : undefined; } catch { return undefined; }
}
export function photoSet(photo: Photo | undefined) {
  if (photo?.localBase) return [480,1000,1800].filter(w => w <= (photo.width || 1800)).map(w => `${photoUrl(photo,w)} ${w}w`).join(', ') || undefined;
  return photo?.asset?._ref ? [480, 800, 1200, 1800, 2400].map(w => `${photoUrl(photo,w)} ${w}w`).join(', ') : undefined;
}
