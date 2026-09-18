// Single permanent identifiers reused across every page's structured data
// so every JSON-LD reference resolves to the same Person/WebSite nodes.

export const PERSON_ID =
  'https://ergysshehu.com/#ergys-shehu';

export const WEBSITE_ID =
  'https://ergysshehu.com/#website';

export const KULT360_ID =
  'https://kult360.com/#organization';


// Core site defaults.
// Sanity values can override these where available.

export const defaults = {
  name:
    'Ergys Shehu',

  headline:
    'Stories\nin light.',

  intro:
    'Fashion, editorial weddings, and cinematic direction —\nAlbania / Worldwide.',

  aboutHeading:
    'Purity. Simplicity.\nHonesty.',

  bio:
    'Since 2017, Ergys Shehu has worked as a freelance fashion and beauty photographer, collaborating with celebrities, models and national and international clients. Purity, simplicity and honesty characterise his photographic style. He lives and works in Albania.',

  bioSq:
    'Që nga viti 2017, Ergys Shehu punon si fotograf i pavarur në modë dhe bukuri, duke bashkëpunuar me artistë, modele dhe klientë kombëtarë e ndërkombëtarë. Pastërtia, thjeshtësia dhe sinqeriteti karakterizojnë stilin e tij fotografik. Jeton dhe punon në Shqipëri.',

  email:
    'e.ergysshehu@gmail.com',

  instagram:
    'https://instagram.com/ergys.shehu',

  youtube:
    'https://www.youtube.com/@ErgysShehu',

  kult360:
    'https://kult360.com',

  linkedin:
    'https://www.linkedin.com/in/ergysshehu/',

  facebook:
    'https://www.facebook.com/ergysshehuphotography',

  seoDescription:
    'Award-winning photographer, videographer and director Ergys Shehu works across Albania in weddings, fashion, portraits, events, commercial campaigns, music videos and creative collaborations, with projects available worldwide.',

  seoDescriptionSq:
    'Ergys Shehu është fotograf, videograf dhe regjisor i vlerësuar me çmime, aktiv në të gjithë Shqipërinë në dasma, modë, portrete, ngjarje, fushata komerciale, videoklipe dhe bashkëpunime krijuese, si edhe në projekte ndërkombëtare.'
};


// Featured YouTube films.

export const films = [
  {
    id:
      '_yur69PW-10',

    label:
      'Kujtimi (Remix)'
  },

  {
    id:
      'o01_26Q2SfY'
  },

  {
    id:
      '3WgyoTNFw7I'
  }
] as const;


// Biography used when Sanity has no override.

export const biography = {
  en:
    'Born in Shkodër, Ergys Shehu brings a background in painting and graphic design to photography, film and creative direction. His work moves between fashion and beauty, commercial campaigns, music videos and cultural projects.\n\nIn 2017, he founded ALERDIGITALMEDIA. In 2020, he received the “Loving Art” award at Netët e Klipit Shqiptar. In 2026, his music video “Kujtimi” received the awards for Best Director and Best Female Performance / Interpretation. Alongside his photographic practice, he has worked on Islamic decorative art and murals in more than 40 places of worship across the Balkans and Europe, combining calligraphy, geometric patterns and arabesque motifs.\n\nAs Executive Director of the Kult 360 Foundation, he connects cultural heritage with contemporary visual production and immersive technologies. He lives and works in Albania.',

  sq:
    'Ergys Shehu ka lindur në Shkodër. Që në moshë të re, ai shfaqi pasion për pikturën. Në vitin 2005 nisi mësimet në degën e pikturës në liceun artistik në Shkodër, për të vazhduar më pas studimet në arte pranë Universitetit të Shkodrës, me formim në pikturë, grafikë, fotografi dhe teknika digjitale.\n\nI specializuar në fotografinë e modës dhe bukurisë, Shehu ka zhvilluar një stil të dallueshëm dhe bashkëpunon me agjenci, modele, artistë dhe profesionistë të grimit e stilimit. Në vitin 2017 themeloi ALERDIGITALMEDIA, kushtuar fotografisë, videoklipeve dhe ceremonive martesore. Në vitin 2020 u vlerësua me çmimin “Loving Art” në Netët e Klipit Shqiptar. Në vitin 2026, videoklipi i tij “Kujtimi” u vlerësua me çmimet Best Director dhe Best Female Performance / Interpretation.\n\nPraktika e tij përfshin gjithashtu artin dekorativ islam, me murale në mbi 40 objekte kulti në Ballkan dhe Europë. Në rolin e Drejtorit Ekzekutiv të Fondacionit Kult 360, ai ndërthur trashëgiminë kulturore me prodhimin vizual dhe teknologjitë imersive. Jeton dhe punon në Shqipëri.',

  quote:
    'Vision does not ask for permission. It demands a field of action. In the digital age, man is the important creative mind, not the algorithm. True art is complicated human simplicity; it is the clear voice amidst the noise.'
};


// Main portfolio sections.
// Visible titles/subtitles stay unchanged.
// seoDescription is only search/social metadata.

export const sections = [
  {
    slug:
      'fashion',

    title:
      'Fashion',

    subtitle:
      'Editorials & Campaigns',

    texture:
      't-fashion',

    seoDescription:
      'Fashion, editorial, beauty and campaign photography by award-winning photographer and director Ergys Shehu, working with models, artists, brands and creative teams across Albania and internationally.'
  },

  {
    slug:
      'weddings',

    title:
      'Weddings',

    subtitle:
      'People in love',

    texture:
      't-wedding',

    seoDescription:
      'Wedding photographer and videographer Ergys Shehu creates editorial photography, cinematic wedding films and emotional visual stories for couples across Albania and destination weddings worldwide.'
  },

  {
    slug:
      'portraits',

    title:
      'Portraits',

    subtitle:
      'Beauty in reality',

    texture:
      't-portrait',

    seoDescription:
      'Portrait, beauty, editorial and personal branding photography by Ergys Shehu for individuals, artists, models, professionals and creative collaborations across Albania and worldwide.'
  },

  {
    slug:
      'films',

    title:
      'Film & Video',

    subtitle:
      'Music videos, short films and visual stories.',

    texture:
      'film-image',

    seoDescription:
      'Videography and direction by Ergys Shehu for music videos, commercial films, campaigns, events, artists, brands, cultural projects and cinematic visual storytelling across Albania and internationally.'
  }
] as const;


// Recognition.

export interface Recognition {
  year: string;
  title: string;
  project?: string;
  organization?: string;
  note?: string;
  link?: string;
}

export const recognitions:
  Recognition[] = [
    {
      year:
        '2026',

      title:
        'Best Director',

      project:
        '“Kujtimi”'
    },

    {
      year:
        '2026',

      title:
        'Best Female Performance / Interpretation',

      project:
        '“Kujtimi”'
    },

    {
      year:
        '2026',

      title:
        'Europe Week — Open Space',

      note:
        'Selected Project',

      link:
        '/journal/europe-week-2026-terminal/'
    },

    {
      year:
        '2020',

      title:
        '“Loving Art”',

      organization:
        'Netët e Klipit Shqiptar',

      link:
        '/journal/best-director-2020-turning-point/'
    }
  ];


// Editorial gallery pacing.

export interface GalleryPhoto {
  width?: number;
  height?: number;
}

export interface GalleryRow<T> {
  type:
    | 'full'
    | 'pair'
    | 'solo';

  align?:
    | 'left'
    | 'right';

  items:
    T[];
}

function isPortrait(
  photo:
    GalleryPhoto
) {
  return Boolean(
    photo.height &&
    photo.width &&
    photo.height >
      photo.width
  );
}

export function paceGallery<
  T extends GalleryPhoto
>(
  photos:
    T[]
): GalleryRow<T>[] {
  const rows:
    GalleryRow<T>[] = [];

  let i =
    0;

  while (
    i <
    photos.length
  ) {
    const a =
      photos[i];

    if (
      i === 0
    ) {
      rows.push({
        type:
          'full',

        items: [
          a
        ]
      });

      i++;

      continue;
    }

    const b =
      photos[
        i + 1
      ];

    if (
      b &&
      isPortrait(a) &&
      isPortrait(b)
    ) {
      rows.push({
        type:
          'pair',

        items: [
          a,
          b
        ]
      });

      i +=
        2;

      continue;
    }

    if (
      rows.length %
        4 ===
      3
    ) {
      rows.push({
        type:
          'full',

        items: [
          a
        ]
      });

      i++;

      continue;
    }

    rows.push({
      type:
        'solo',

      align:
        rows.length %
          2 ===
        0
          ? 'left'
          : 'right',

      items: [
        a
      ]
    });

    i++;
  }

  return rows;
}
