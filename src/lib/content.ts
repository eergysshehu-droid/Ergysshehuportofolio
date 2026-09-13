import {createClient} from '@sanity/client';
import {createImageUrlBuilder} from '@sanity/image-url';
export interface Photo {asset: {_ref: string}; alt?: string; caption?: string; credit?: string; crop?: any; hotspot?: any}
export interface Album {title: string; slug: string; description?: string; category?: string; cover?: Photo; photos?: Photo[]; location?: string; year?: number}
export interface Settings {name?: string; headline?: string; bio?: string; portrait?: Photo; email?: string; instagram?: string; seoDescription?: string}
const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || '46mghxoy';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const client = projectId ? createClient({projectId, dataset, apiVersion: '2026-09-01', useCdn: false, perspective: 'published', token: import.meta.env.SANITY_API_READ_TOKEN || undefined}) : null;
let cached: Promise<{settings: Settings; albums: Album[]}> | undefined;
export function content(): Promise<{settings: Settings; albums: Album[]}> {
  return cached ??= (client ? client.fetch(`{
    "settings": *[_type == "siteSettings" && _id == "siteSettings"][0],
    "albums": *[_type == "album" && defined(slug.current)] | order(order asc, _createdAt desc) {title, "slug": slug.current, description, "category": category->title, cover, photos, location, year}
  }`).then(data => ({settings: data.settings || {}, albums: data.albums || []})) : Promise.resolve({settings: {}, albums: []}));
}
export function photoUrl(photo: Photo | undefined, width = 1400) {
  if (!client || !photo?.asset?._ref) return undefined;
  return createImageUrlBuilder(client).image(photo).width(width).fit('max').auto('format').quality(85).url();
}
