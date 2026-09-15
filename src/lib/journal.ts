import {createClient} from '@sanity/client';
import localJournal from '../data/local-journal.json';
import type {Photo} from './content';

export interface PortableSpan {_type: 'span'; text: string; marks?: string[]}
export interface PortableMarkDef {_key: string; _type: string; href?: string}
// childrenSq is the Albanian translation of the same block, kept as its own
// span array (not a plain string) so a block with an inline link — see
// kujtimi-remix's closing "Watch it on YouTube" — can carry that same link
// in the Albanian text too, reusing markDefs.
export interface PortableBlock {_type: 'block'; style?: string; children: PortableSpan[]; childrenSq?: PortableSpan[]; markDefs?: PortableMarkDef[]}
export type PortableItem = PortableBlock | (Photo & {_type: 'portfolioPhoto'});
export interface Post {title: string; titleSq?: string; slug: string; excerpt: string; excerptSq?: string; category?: string; categorySq?: string; cover?: Photo; body: PortableItem[]; publishedAt: string}

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || '46mghxoy';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const client = projectId ? createClient({projectId, dataset, apiVersion: '2026-09-01', useCdn: false, perspective: 'published', token: import.meta.env.SANITY_API_READ_TOKEN || undefined}) : null;

let cached: Promise<Post[]> | undefined;
export function journal(): Promise<Post[]> {
  if (import.meta.env.DESIGN_PREVIEW === '1') {
    if (import.meta.env.CF_PAGES) throw new Error('DESIGN_PREVIEW is only for local design review.');
    return Promise.resolve(localJournal as Post[]);
  }
  return cached ??= (client ? client.fetch(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {title, "slug": slug.current, excerpt, cover, body, publishedAt}`)
    .then((posts: Post[]) => [...new Map([...(localJournal as Post[]), ...posts].map(p => [p.slug, p])).values()].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)))
    .catch(() => localJournal as Post[]) : Promise.resolve(localJournal as Post[]));
}
