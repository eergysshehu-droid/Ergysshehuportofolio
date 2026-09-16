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
        useCdn: true,
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

function normalizePhoto(
  photo?: Photo
): Photo | undefined {
  if (!photo) {
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

function normalizePortableItem(
  item:
    PortableItem
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

  return item;
}

function normalizePost(
  post: Post
): Post {
  const body =
    (
      post.body ||
      []
    ).map(
      normalizePortableItem
    );

  const bodySq =
    (
      post.bodySq &&
      post.bodySq.length
        ? post.bodySq
        : body
    ).map(
      normalizePortableItem
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

export function journal():
  Promise<Post[]> {

  if (
    import.meta.env
      .DESIGN_PREVIEW === '1'
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
      (
        localJournal as
        Post[]
      ).map(
        normalizePost
      )
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

                const localPosts =
                  (
                    localJournal as
                    Post[]
                  ).map(
                    normalizePost
                  );

                const sanityPosts =
                  (
                    posts ||
                    []
                  ).map(
                    normalizePost
                  );

                return [
                  ...new Map(
                    [
                      ...localPosts,
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
                (
                  localJournal as
                  Post[]
                ).map(
                  normalizePost
                )
            )
        : Promise.resolve(
            (
              localJournal as
              Post[]
            ).map(
              normalizePost
            )
          )
    );
}
