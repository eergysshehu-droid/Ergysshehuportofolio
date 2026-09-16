import {
  defineType,
  defineField,
  defineArrayMember
} from 'sanity';

const portableText = [
  defineArrayMember({
    type: 'block',
    styles: [
      {
        title: 'Normal',
        value: 'normal'
      },
      {
        title: 'H2',
        value: 'h2'
      },
      {
        title: 'H3',
        value: 'h3'
      },
      {
        title: 'Citim',
        value: 'blockquote'
      }
    ]
  }),
  defineArrayMember({
    type: 'portfolioPhoto'
  })
];

const photo = defineType({
  name: 'portfolioPhoto',
  title: 'Fotografi',
  type: 'image',

  options: {
    hotspot: true
  },

  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text — English',
      type: 'string',
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'altSq',
      title: 'Alt text — Shqip',
      type: 'string',
      description:
        'Opsionale. Nëse lihet bosh, website përdor versionin English.'
    }),

    defineField({
      name: 'caption',
      title: 'Caption — English',
      type: 'string'
    }),

    defineField({
      name: 'captionSq',
      title: 'Caption — Shqip',
      type: 'string'
    }),

    defineField({
      name: 'credit',
      title: 'Autori / krediti',
      type: 'string'
    })
  ]
});

const category = defineType({
  name: 'category',
  title: 'Kategori',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Emri — English',
      type: 'string',
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'titleSq',
      title: 'Emri — Shqip',
      type: 'string'
    })
  ]
});

const album = defineType({
  name: 'album',
  title: 'Albume',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Titulli — English',
      type: 'string',
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'titleSq',
      title: 'Titulli — Shqip',
      type: 'string',
      description:
        'Nëse lihet bosh, versioni shqip përdor titullin English.'
    }),

    defineField({
      name: 'slug',
      title: 'Adresa',
      type: 'slug',
      options: {
        source: 'title'
      },
      validation: r =>
        r
          .required()
          .custom(
            value =>
              !value?.current ||
              /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
                value.current
              ) ||
              'Përdor shkronja të vogla, numra dhe viza.'
          )
    }),

    defineField({
      name: 'description',
      title: 'Përshkrimi — English',
      type: 'text'
    }),

    defineField({
      name: 'descriptionSq',
      title: 'Përshkrimi — Shqip',
      type: 'text'
    }),

    defineField({
      name: 'kind',
      title: 'Seksioni i portfolion',
      type: 'string',
      options: {
        list: [
          'fashion',
          'weddings',
          'portraits',
          'films',
          'projects'
        ]
      },
      initialValue: 'fashion',
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'featured',
      title: 'Shfaq në homepage',
      type: 'boolean',
      initialValue: false
    }),

    defineField({
      name: 'videoUrl',
      title:
        'Linku i videos / YouTube / Vimeo',
      type: 'url',
      validation: r =>
        r.uri({
          scheme: ['https']
        })
    }),

    defineField({
      name: 'credits',
      title: 'Credits / ekipi — English',
      type: 'text'
    }),

    defineField({
      name: 'creditsSq',
      title: 'Credits / ekipi — Shqip',
      type: 'text'
    }),

    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'reference',
      to: [
        {
          type: 'category'
        }
      ]
    }),

    defineField({
      name: 'cover',
      title: 'Kopertina',
      type: 'portfolioPhoto',
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'photos',
      title:
        'Fotografitë — tërhiq për renditje',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'portfolioPhoto'
        })
      ],

      validation: r =>
        r.custom(
          (value, context) =>
            context.document?.kind ===
            'films'
              ? Boolean(
                  value?.length ||
                  context.document
                    ?.videoUrl
                ) ||
                'Shto fotografi ose një video.'
              : Boolean(
                  value?.length
                ) ||
                'Shto të paktën një fotografi.'
        )
    }),

    defineField({
      name: 'location',
      title: 'Vendndodhja — English',
      type: 'string'
    }),

    defineField({
      name: 'locationSq',
      title: 'Vendndodhja — Shqip',
      type: 'string'
    }),

    defineField({
      name: 'year',
      title: 'Viti',
      type: 'number',
      validation: r =>
        r
          .integer()
          .min(1900)
          .max(2200)
    }),

    defineField({
      name: 'order',
      title: 'Renditja në faqe',
      type: 'number',
      initialValue: 0
    })
  ],

  preview: {
    select: {
      title: 'title',
      media: 'cover'
    }
  }
});

const settings = defineType({
  name: 'siteSettings',
  title: 'Profili dhe kontakti',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      title: 'Emri',
      type: 'string',
      initialValue:
        'Ergys Shehu',
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'headline',
      title:
        'Titulli kryesor — English',
      type: 'string'
    }),

    defineField({
      name: 'headlineSq',
      title:
        'Titulli kryesor — Shqip',
      type: 'string'
    }),

    defineField({
      name: 'intro',
      title:
        'Teksti poshtë titullit — English',
      type: 'text'
    }),

    defineField({
      name: 'introSq',
      title:
        'Teksti poshtë titullit — Shqip',
      type: 'text'
    }),

    defineField({
      name: 'aboutHeading',
      title:
        'Titulli About — English',
      type: 'text'
    }),

    defineField({
      name: 'aboutHeadingSq',
      title:
        'Titulli About — Shqip',
      type: 'text'
    }),

    defineField({
      name: 'heroImage',
      title:
        'Fotografia kryesore',
      type: 'portfolioPhoto'
    }),

    defineField({
      name: 'fashionCover',
      title:
        'Kopertina Fashion',
      type: 'portfolioPhoto'
    }),

    defineField({
      name: 'weddingsCover',
      title:
        'Kopertina Weddings',
      type: 'portfolioPhoto'
    }),

    defineField({
      name: 'portraitsCover',
      title:
        'Kopertina Portraits',
      type: 'portfolioPhoto'
    }),

    defineField({
      name: 'filmCover',
      title:
        'Kopertina Film',
      type: 'portfolioPhoto'
    }),

    defineField({
      name: 'reelUrl',
      title:
        'Linku i showreel',
      type: 'url',
      validation: r =>
        r.uri({
          scheme: ['https']
        })
    }),

    defineField({
      name: 'bio',
      title:
        'Rreth meje — English',
      type: 'text'
    }),

    defineField({
      name: 'bioSq',
      title:
        'Rreth meje — Shqip',
      type: 'text'
    }),

    defineField({
      name: 'biographyEn',
      title:
        'Biografia e plotë — English',
      type: 'text'
    }),

    defineField({
      name: 'biographySq',
      title:
        'Biografia e plotë — Shqip',
      type: 'text'
    }),

    defineField({
      name: 'artistQuote',
      title:
        'Thënia e artistit — English',
      type: 'text'
    }),

    defineField({
      name: 'artistQuoteSq',
      title:
        'Thënia e artistit — Shqip',
      type: 'text'
    }),

    defineField({
      name: 'portrait',
      title: 'Portreti',
      type: 'portfolioPhoto'
    }),

    defineField({
      name: 'email',
      title:
        'Email publik për kontakt',
      type: 'string',
      validation: r =>
        r.email()
    }),

    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
      validation: r =>
        r.uri({
          scheme: ['https']
        })
    }),

    defineField({
      name: 'seoDescription',
      title:
        'SEO description — English',
      type: 'text',
      validation: r =>
        r.max(160)
    }),

    defineField({
      name: 'seoDescriptionSq',
      title:
        'SEO description — Shqip',
      type: 'text',
      validation: r =>
        r.max(160)
    })
  ]
});

const post = defineType({
  name: 'post',
  title: 'Artikuj (Journal)',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Titulli — English',
      type: 'string',
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'titleSq',
      title: 'Titulli — Shqip',
      type: 'string'
    }),

    defineField({
      name: 'slug',
      title: 'Adresa',
      type: 'slug',
      options: {
        source: 'title'
      },
      validation: r =>
        r
          .required()
          .custom(
            value =>
              !value?.current ||
              /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
                value.current
              ) ||
              'Përdor shkronja të vogla, numra dhe viza.'
          )
    }),

    defineField({
      name: 'excerpt',
      title:
        'Përmbledhje — English',
      type: 'text',
      validation: r =>
        r
          .required()
          .max(200)
    }),

    defineField({
      name: 'excerptSq',
      title:
        'Përmbledhje — Shqip',
      type: 'text',
      validation: r =>
        r.max(200)
    }),

    defineField({
      name: 'category',
      title:
        'Kategoria — English',
      type: 'string'
    }),

    defineField({
      name: 'categorySq',
      title:
        'Kategoria — Shqip',
      type: 'string'
    }),

    defineField({
      name: 'cover',
      title: 'Kopertina',
      type: 'portfolioPhoto',
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'body',
      title:
        'Përmbajtja — English',
      type: 'array',
      of: portableText,
      validation: r =>
        r.required()
    }),

    defineField({
      name: 'bodySq',
      title:
        'Përmbajtja — Shqip',
      type: 'array',
      of: portableText,
      description:
        'Versioni shqip i artikullit. Mund ta plotësosh gradualisht.'
    }),

    defineField({
      name: 'publishedAt',
      title:
        'Data e publikimit',
      type: 'datetime',
      initialValue: () =>
        new Date().toISOString(),
      validation: r =>
        r.required()
    })
  ],

  orderings: [
    {
      title:
        'Data, e fundit e para',
      name:
        'publishedAtDesc',

      by: [
        {
          field:
            'publishedAt',
          direction:
            'desc'
        }
      ]
    }
  ],

  preview: {
    select: {
      title: 'title',
      media: 'cover',
      date: 'publishedAt'
    },

    prepare: ({
      title,
      media,
      date
    }) => ({
      title,
      subtitle:
        date
          ? new Date(
              date
            ).toLocaleDateString()
          : undefined,

      media
    })
  }
});

export const schemaTypes = [
  photo,
  category,
  album,
  settings,
  post
];
