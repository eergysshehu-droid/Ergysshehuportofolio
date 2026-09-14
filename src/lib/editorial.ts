// User-supplied biography and contact details. Sanity values override these defaults.
export const defaults = {
  name: 'Ergys Shehu', headline: 'Stories\nin light.',
  intro: 'Fashion, editorial weddings, and cinematic direction —\nAlbania / Worldwide.',
  aboutHeading: 'Purity. Simplicity.\nHonesty.',
  bio: 'Since 2017, Ergys Shehu has worked as a freelance fashion and beauty photographer, collaborating with celebrities, models and national and international clients. Purity, simplicity and honesty characterise his photographic style. He lives and works in Albania.',
  email: 'e.ergysshehu@gmail.com', instagram: 'https://instagram.com/ergys.shehu',
  seoDescription: 'Ergys Shehu — Photographer and Director. Fashion, editorial weddings, film and music videos. Albania / Worldwide.'
};
export const biography = {
  en: 'Born in Shkodër, Ergys Shehu brings a background in painting and graphic design to photography, film and creative direction. His work moves between fashion and beauty, commercial campaigns, music videos and cultural projects.\n\nIn 2017, he founded ALERT Visual Production Studio. In 2020, he received the Best Director award at Netët e Klipit Shqiptar. Alongside his photographic practice, he has worked on Islamic decorative art and murals in more than 40 places of worship across the Balkans and Europe, combining calligraphy, geometric patterns and arabesque motifs.\n\nAs Executive Director of the Kult 360 Foundation, he connects cultural heritage with contemporary visual production and immersive technologies. He lives and works in Albania.',
  sq: 'Ergys Shehu ka lindur në Shkodër. Që në moshë të re, ai shfaqi pasion për pikturën. Në vitin 2005 nisi mësimet në degën e pikturës në liceun artistik në Shkodër, për të vazhduar më pas studimet në arte pranë Universitetit të Shkodrës, me formim në pikturë, grafikë, fotografi dhe teknika digjitale.\n\nI specializuar në fotografinë e modës dhe bukurisë, Shehu ka zhvilluar një stil të dallueshëm dhe bashkëpunon me agjenci, modele, artistë dhe profesionistë të grimit e stilimit. Në vitin 2017 themeloi ALERT Visual Production Studio, kushtuar fotografisë, videove muzikore dhe ceremonive martesore. Në vitin 2020 u vlerësua me çmimin Best Director në Netët e Klipit Shqiptar.\n\nPraktika e tij përfshin gjithashtu artin dekorativ islam, me murale në mbi 40 objekte kulti në Ballkan dhe Europë. Në rolin e Drejtorit Ekzekutiv të Fondacionit Kult 360, ai ndërthur trashëgiminë kulturore me prodhimin vizual dhe teknologjitë immersive. Jeton dhe punon në Shqipëri.',
  quote: 'Vision does not ask for permission. It demands a field of action. In the digital age, man is the important creative mind, not the algorithm. True art is complicated human simplicity; it is the clear voice amidst the noise.'
};
export const sections = [
  {slug:'fashion', title:'Fashion', subtitle:'Editorials & Campaigns', texture:'t-fashion'},
  {slug:'weddings', title:'Weddings', subtitle:'People in love', texture:'t-wedding'},
  {slug:'portraits', title:'Portraits', subtitle:'Beauty in reality', texture:'t-portrait'},
  {slug:'films', title:'Film & Video', subtitle:'Music videos, short films and visual stories.', texture:'film-image'}
] as const;

// Deterministic editorial pacing for a project's photo essay: a strong opening
// frame, portrait pairs where the sequence allows it, periodic full-bleed
// breaks, and alternating intimate solo frames — instead of a flat, uniform grid.
export interface GalleryPhoto {width?: number; height?: number}
export interface GalleryRow<T> {type: 'full' | 'pair' | 'solo'; align?: 'left' | 'right'; items: T[]}
function isPortrait(photo: GalleryPhoto) {
  return Boolean(photo.height && photo.width && photo.height > photo.width);
}
export function paceGallery<T extends GalleryPhoto>(photos: T[]): GalleryRow<T>[] {
  const rows: GalleryRow<T>[] = [];
  let i = 0;
  while (i < photos.length) {
    const a = photos[i];
    if (i === 0) { rows.push({type: 'full', items: [a]}); i++; continue; }
    const b = photos[i + 1];
    if (b && isPortrait(a) && isPortrait(b)) { rows.push({type: 'pair', items: [a, b]}); i += 2; continue; }
    if (rows.length % 4 === 3) { rows.push({type: 'full', items: [a]}); i++; continue; }
    rows.push({type: 'solo', align: rows.length % 2 === 0 ? 'left' : 'right', items: [a]});
    i++;
  }
  return rows;
}
