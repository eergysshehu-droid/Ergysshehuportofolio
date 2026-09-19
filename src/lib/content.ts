import {createClient} from '@sanity/client';
import {createImageUrlBuilder} from '@sanity/image-url';
import localPortfolio from '../data/local-portfolio.json';

export interface Photo {
  asset?: {_ref: string};
  src?: string;
  localBase?: string;
  width?: number;
  height?: number;
  alt?: string;
  altSq?: string;
  caption?: string;
  captionSq?: string;
  credit?: string;
  crop?: any;
  hotspot?: any;
  color?: string;
}

export interface Album {
  title: string;
  titleSq?: string;
  slug: string;
  description?: string;
  descriptionSq?: string;
  category?: string;
  categorySq?: string;
  kind?: string;
  featured?: boolean;
  videoUrl?: string;
  credits?: string;
  creditsSq?: string;
  cover?: Photo;
  nextProjectCover?: Photo;
  photos?: Photo[];
  location?: string;
  locationSq?: string;
  year?: number;
}

export interface Settings {
  name?: string;

  headline?: string;
  headlineSq?: string;

  intro?: string;
  introSq?: string;

  aboutHeading?: string;
  aboutHeadingSq?: string;

  bio?: string;
  bioSq?: string;

  biographyEn?: string;
  biographySq?: string;

  artistQuote?: string;
  artistQuoteSq?: string;

  portrait?: Photo;
  aboutAwardImage?: Photo;
  behindLensImage?: Photo;
  heroImage?: Photo;
  fashionCover?: Photo;
  weddingsCover?: Photo;
  portraitsCover?: Photo;
  filmCover?: Photo;

  reelUrl?: string;
  email?: string;
  instagram?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  whatsappMessageSq?: string;

  seoDescription?: string;
  seoDescriptionSq?: string;
}

const projectId =
  import.meta.env.PUBLIC_SANITY_PROJECT_ID ||
  '46mghxoy';

const dataset =
  import.meta.env.PUBLIC_SANITY_DATASET ||
  'production';

const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2026-09-01',
      useCdn: false,
      perspective: 'published',
      token:
        import.meta.env.SANITY_API_READ_TOKEN ||
        undefined
    })
  : null;

let cached:
  | Promise<{
      settings: Settings;
      albums: Album[];
    }>
  | undefined;

function bilingualPhoto(
  photo?: Photo
): Photo | undefined {
  if (!photo) return undefined;

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

function normalizeAlbum(
  album: Album
): Album {
  return {
    ...album,

    titleSq:
      album.titleSq ||
      album.title,

    descriptionSq:
      album.descriptionSq ||
      album.description,

    categorySq:
      album.categorySq ||
      album.category,

    creditsSq:
      album.creditsSq ||
      album.credits,

    locationSq:
      album.locationSq ||
      album.location,

    cover:
      bilingualPhoto(
        album.cover
      ),
    nextProjectCover:
      bilingualPhoto(
        album.nextProjectCover
      ),
    photos:
      album.photos?.map(
        photo =>
          bilingualPhoto(photo)!
      )
  };
}

function normalizeSettings(
  settings: Settings
): Settings {
  return {
    ...settings,

    headlineSq:
      settings.headlineSq ||
      settings.headline,

    introSq:
      settings.introSq ||
      settings.intro,

    aboutHeadingSq:
      settings.aboutHeadingSq ||
      settings.aboutHeading,

    bioSq:
      settings.bioSq ||
      settings.bio,

    biographySq:
      settings.biographySq ||
      settings.biographyEn,

    artistQuoteSq:
      settings.artistQuoteSq ||
      settings.artistQuote,

    seoDescriptionSq:
      settings.seoDescriptionSq ||
      settings.seoDescription,

    portrait:
      bilingualPhoto(
        settings.portrait
      ),

    aboutAwardImage:
      bilingualPhoto(
        settings.aboutAwardImage
      ),

    behindLensImage:
      bilingualPhoto(
        settings.behindLensImage
      ),

    heroImage:
      bilingualPhoto(
        settings.heroImage
      ),

    fashionCover:
      bilingualPhoto(
        settings.fashionCover
      ),

    weddingsCover:
      bilingualPhoto(
        settings.weddingsCover
      ),

    portraitsCover:
      bilingualPhoto(
        settings.portraitsCover
      ),

    filmCover:
      bilingualPhoto(
        settings.filmCover
      )
  };
}

export function content():
  Promise<{
    settings: Settings;
    albums: Album[];
  }> {

  if (
    import.meta.env
      .DESIGN_PREVIEW === '1'
  ) {
    if (
      import.meta.env.CF_PAGES
    ) {
      throw new Error(
        'DESIGN_PREVIEW is only for local design review.'
      );
    }

    return Promise.resolve({
      settings:
        normalizeSettings(
          localPortfolio.settings
        ),

      albums:
        localPortfolio.albums.map(
          album =>
            normalizeAlbum(
              album
            )
        )
    });
  }

  return cached ??=
    (
      client
        ? client
            .fetch(`
{
  "settings":
    *[
      _type == "siteSettings"
      &&
      _id == "siteSettings"
    ][0] {
      name,

      headline,
      headlineSq,

      intro,
      introSq,

      aboutHeading,
      aboutHeadingSq,

      bio,
      bioSq,

      biographyEn,
      biographySq,

      artistQuote,
      artistQuoteSq,

      portrait,
      aboutAwardImage,
      behindLensImage,
      heroImage,
      fashionCover,
      weddingsCover,
      portraitsCover,
      filmCover,

      reelUrl,
      email,
      instagram,
      whatsappNumber,
      whatsappMessage,
      whatsappMessageSq,

      seoDescription,
      seoDescriptionSq
    },

  "albums":
    *[
      _type == "album"
      &&
      defined(slug.current)
    ]
    | order(
        order asc,
        _createdAt desc
      ) {
      title,
      titleSq,

      "slug":
        slug.current,

      description,
      descriptionSq,

      "category":
        category->title,

      "categorySq":
        category->titleSq,

      kind,
      featured,
      videoUrl,

      credits,
      creditsSq,

      cover {
        ...,
        alt,
        altSq,
        caption,
        captionSq,
        credit
      },
      
    nextProjectCover {
      ...,
      alt,
      altSq,
      caption,
      captionSq,
      credit
    },
      photos[] {
        ...,
        alt,
        altSq,
        caption,
        captionSq,
        credit
      },

      location,
      locationSq,

      year
    }
}
            `)
            .then(data => {
              const sanitySettings:
                Settings =
                data.settings ||
                {};

              const mergedSettings =
                normalizeSettings({
                  ...localPortfolio.settings,
                  ...Object.fromEntries(
                    Object.entries(
                      sanitySettings
                    ).filter(
                      ([, value]) =>
                        value != null
                    )
                  )
                });

              const sanityAlbums:
                Album[] =
                (
                  data.albums ||
                  []
                ).map(
                  (
                    album:
                      Album
                  ) =>
                    normalizeAlbum(
                      album
                    )
                );

              const localAlbums =
                localPortfolio.albums.map(
                  album =>
                    normalizeAlbum(
                      album
                    )
                );

              const albums =
                [
                  ...new Map(
                    [
                      ...localAlbums,
                      ...sanityAlbums
                    ].map(
                      album => [
                        album.slug,
                        album
                      ]
                    )
                  ).values()
                ];

              return {
                settings:
                  mergedSettings,

                albums
              };
            })
            .catch(() => ({
              settings:
                normalizeSettings(
                  localPortfolio.settings
                ),

              albums:
                localPortfolio.albums.map(
                  album =>
                    normalizeAlbum(
                      album
                    )
                )
            }))
        : Promise.resolve({
            settings:
              normalizeSettings(
                localPortfolio.settings
              ),

            albums:
              localPortfolio.albums.map(
                album =>
                  normalizeAlbum(
                    album
                  )
              )
          })
    );
}

export function photoUrl(
  photo:
    | Photo
    | undefined,
  width = 1400
) {
  if (
    photo?.localBase
  ) {
    return `${photo.localBase}-${
      width <= 480
        ? 480
        : width <= 1000
          ? 1000
          : 1800
    }.webp`;
  }

  if (
    photo?.src
  ) {
    return photo.src;
  }

  if (
    !client ||
    !photo?.asset?._ref
  ) {
    return undefined;
  }

  return createImageUrlBuilder(
    client
  )
    .image(photo)
    .width(width)
    .fit('max')
    .auto('format')
    .quality(85)
    .url();
}

export function albumKind(
  album: Album
) {
  if (
    album.kind
  ) {
    return album.kind;
  }

  const category =
    album.category
      ?.toLowerCase() ||
    '';

  if (
    /wedding/.test(
      category
    )
  ) {
    return 'weddings';
  }

  if (
    /portrait/.test(
      category
    )
  ) {
    return 'portraits';
  }

  if (
    /film|video|music/.test(
      category
    )
  ) {
    return 'films';
  }

  if (
    /fashion|editorial/.test(
      category
    )
  ) {
    return 'fashion';
  }

  return 'projects';
}

export function safeUrl(
  value?: string
) {
  try {
    const url =
      new URL(
        value || ''
      );

    return url.protocol ===
      'https:'
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function photoPosition(
  photo:
    | Photo
    | undefined,
  fallback =
    '50% 32%'
) {
  if (
    photo?.hotspot?.x !=
      null &&
    photo?.hotspot?.y !=
      null
  ) {
    return `${
      (
        photo.hotspot.x *
        100
      ).toFixed(1)
    }% ${
      (
        photo.hotspot.y *
        100
      ).toFixed(1)
    }%`;
  }

  return fallback;
}

export function photoSet(
  photo:
    | Photo
    | undefined
) {
  if (
    photo?.localBase
  ) {
    return [
      480,
      1000,
      1800
    ]
      .filter(
        width =>
          width <=
          (
            photo.width ||
            1800
          )
      )
      .map(
        width =>
          `${photoUrl(
            photo,
            width
          )} ${width}w`
      )
      .join(', ') ||
      undefined;
  }

  return photo?.asset?._ref
    ? [
        480,
        800,
        1200,
        1800,
        2400
      ]
        .map(
          width =>
            `${photoUrl(
              photo,
              width
            )} ${width}w`
        )
        .join(', ')
    : undefined;
}
