import {defineType, defineField, defineArrayMember} from 'sanity';
const photo = defineType({name: 'portfolioPhoto', title: 'Fotografi', type: 'image', options: {hotspot: true}, fields: [
  defineField({name: 'alt', title: 'Përshkrimi për aksesueshmëri', type: 'string', validation: r => r.required()}),
  defineField({name: 'caption', title: 'Diçitura', type: 'string'}),
  defineField({name: 'credit', title: 'Autori / krediti', type: 'string'})
]});
const category = defineType({name: 'category', title: 'Kategori', type: 'document', fields: [
  defineField({name: 'title', title: 'Emri', type: 'string', validation: r => r.required()})
]});
const album = defineType({name: 'album', title: 'Albume', type: 'document', fields: [
  defineField({name: 'title', title: 'Titulli', type: 'string', validation: r => r.required()}),
  defineField({name: 'slug', title: 'Adresa', type: 'slug', options: {source: 'title'}, validation: r => r.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || 'Përdor shkronja të vogla, numra dhe viza.')}),
  defineField({name: 'description', title: 'Përshkrimi', type: 'text'}),
  defineField({name: 'category', title: 'Kategoria', type: 'reference', to: [{type: 'category'}]}),
  defineField({name: 'cover', title: 'Kopertina', type: 'portfolioPhoto', validation: r => r.required()}),
  defineField({name: 'photos', title: 'Fotografitë — tërhiq për renditje', type: 'array', of: [defineArrayMember({type: 'portfolioPhoto'})], validation: r => r.min(1).required()}),
  defineField({name: 'location', title: 'Vendndodhja', type: 'string'}),
  defineField({name: 'year', title: 'Viti', type: 'number', validation: r => r.integer().min(1900).max(2200)}),
  defineField({name: 'order', title: 'Renditja në faqe', type: 'number', initialValue: 0})
], preview: {select: {title: 'title', media: 'cover'}}});
const settings = defineType({name: 'siteSettings', title: 'Profili dhe kontakti', type: 'document', fields: [
  defineField({name: 'name', title: 'Emri', type: 'string', initialValue: 'Ergys Shehu', validation: r => r.required()}),
  defineField({name: 'headline', title: 'Titulli kryesor', type: 'string'}),
  defineField({name: 'bio', title: 'Rreth meje', type: 'text'}),
  defineField({name: 'portrait', title: 'Portreti', type: 'portfolioPhoto'}),
  defineField({name: 'email', title: 'Email publik për kontakt', type: 'string', validation: r => r.email()}),
  defineField({name: 'instagram', title: 'Instagram URL', type: 'url', validation: r => r.uri({scheme: ['https']})}),
  defineField({name: 'seoDescription', title: 'Përshkrimi në kërkim', type: 'text', validation: r => r.max(160)})
]});
export const schemaTypes = [photo, category, album, settings];
