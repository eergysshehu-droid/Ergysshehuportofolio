import {
  createClient
} from '@sanity/client';

import localJournal
  from '../data/local-journal.json';

import type {
  Photo
} from './content';


export interface PortableSpan {
  _type: 'span';
  text: string;
  marks?: string[];
}


export interface PortableMarkDef {
  _key: string;
  _type: string;
  href?: string;
}


export interface PortableBlock {
  _type: 'block';

  style?: string;

  children:
    PortableSpan[];

  childrenSq?:
    PortableSpan[];

  markDefs?:
    PortableMarkDef[];
}


export type PortableItem =
  | PortableBlock
  | (
      Photo & {
        _type:
          'portfolioPhoto';
      }
    );


export interface Post {
  title: string;
  titleSq?: string;

  slug: string;

  excerpt: string;
  excerptSq?: string;

  category?: string;
  categorySq?: string;

  cover?: Photo;

  body:
    PortableItem[];

  bodySq?:
    PortableItem[];

  publishedAt: string;
}


type ContentLanguage =
  | 'en'
  | 'sq';


const projectId =
  import.meta.env
    .PUBLIC_SANITY_PROJECT_ID ||
  '46mghxoy';


const dataset =
  import.meta.env
    .PUBLIC_SANITY_DATASET ||
  'production';


const client =
  projectId
    ? createClient({
        projectId,
        dataset,

        apiVersion:
          '2026-09-01',

        useCdn:
          true,

        perspective:
          'published',

        token:
          import.meta.env
            .SANITY_API_READ_TOKEN ||
          undefined
      })
    : null;


let cached:
  | Promise<Post[]>
  | undefined;


/*
 * Normalises bilingual metadata on photographs.
 */
function normalizePhoto(
  photo?: Photo
): Photo | undefined {

  if (
    !photo
  ) {
    return undefined;
  }

  return {
    ...photo,

    altSq:
      photo.altSq ||
      photo.alt,

    captionSq:
      photo.captionSq ||
      photo.caption
  };
}


/*
 * Normalises a Portable Text item.
 *
 * Important:
 * local-journal.json stores some Albanian translations
 * inside childrenSq on the same block.
 *
 * Previously those translations existed in the data,
 * but the rendered body still used children.
 *
 * For the SQ version we now promote childrenSq to children.
 * This means the existing article renderer can continue
 * rendering item.children without special cases.
 */
function normalizePortableItem(
  item: PortableItem,
  language:
    ContentLanguage
): PortableItem {

  if (
    item._type ===
    'portfolioPhoto'
  ) {
    return {
      ...item,

      altSq:
        item.altSq ||
        item.alt,

      captionSq:
        item.captionSq ||
        item.caption
    };
  }

  const translatedChildren =
    language ===
      'sq' &&
    item.childrenSq &&
    item.childrenSq.length
      ? item.childrenSq
      : item.children;

  return {
    ...item,

    children:
      translatedChildren
  };
}


/*
 * Normalises a full journal post into two explicit bodies:
 *
 * body   -> English
 * bodySq -> Albanian
 *
 * Sanity posts with a dedicated bodySq continue to work.
 * Local posts that use childrenSq now work correctly too.
 */
function normalizePost(
  post: Post
): Post {

  const originalBody =
    post.body ||
    [];

  const body =
    originalBody.map(
      item =>
        normalizePortableItem(
          item,
          'en'
        )
    );

  const sqSource =
    post.bodySq &&
    post.bodySq.length
      ? post.bodySq
      : originalBody;

  const bodySq =
    sqSource.map(
      item =>
        normalizePortableItem(
          item,
          'sq'
        )
    );

  return {
    ...post,

    titleSq:
      post.titleSq ||
      post.title,

    excerptSq:
      post.excerptSq ||
      post.excerpt,

    categorySq:
      post.categorySq ||
      post.category,

    cover:
      normalizePhoto(
        post.cover
      ),

    body,

    bodySq
  };
}


function localPosts() {
  return (
    localJournal as
    Post[]
  ).map(
    normalizePost
  );
}


export function journal():
  Promise<Post[]> {

  if (
    import.meta.env
      .DESIGN_PREVIEW ===
    '1'
  ) {
    if (
      import.meta.env
        .CF_PAGES
    ) {
      throw new Error(
        'DESIGN_PREVIEW is only for local design review.'
      );
    }

    return Promise.resolve(
      localPosts()
    );
  }


  return cached ??=
    (
      client
        ? client
            .fetch(`
*[
  _type == "post"
  &&
  defined(slug.current)
]
| order(
    publishedAt desc
  ) {
  title,
  titleSq,

  "slug":
    slug.current,

  excerpt,
  excerptSq,

  category,
  categorySq,

  cover {
    ...,
    alt,
    altSq,
    caption,
    captionSq,
    credit
  },

  body[] {
    ...,

    _type == "portfolioPhoto" => {
      ...,
      alt,
      altSq,
      caption,
      captionSq,
      credit
    }
  },

  bodySq[] {
    ...,

    _type == "portfolioPhoto" => {
      ...,
      alt,
      altSq,
      caption,
      captionSq,
      credit
    }
  },

  publishedAt
}
            `)
            .then(
              (
                posts:
                  Post[]
              ) => {

                const local =
                  localPosts();

                const sanityPosts =
                  (
                    posts ||
                    []
                  ).map(
                    normalizePost
                  );

                /*
                 * Preserve the current behaviour:
                 * local content is available as a fallback,
                 * while a Sanity post with the same slug wins.
                 *
                 * We are NOT changing the content-source
                 * architecture in this batch.
                 */
                return [
                  ...new Map(
                    [
                      ...local,
                      ...sanityPosts
                    ].map(
                      post => [
                        post.slug,
                        post
                      ]
                    )
                  ).values()
                ].sort(
                  (
                    a,
                    b
                  ) =>
                    a.publishedAt <
                    b.publishedAt
                      ? 1
                      : -1
                );
              }
            )
            .catch(
              () =>
                localPosts()
            )

        : Promise.resolve(
            localPosts()
          )
    );
}
