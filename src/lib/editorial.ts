// Single permanent identifiers reused across every page's structured data
// (Layout.astro, about.astro, …) so every JSON-LD reference resolves to the
// same Person/WebSite node in Google's graph instead of minting a fresh one
// per page.
export const PERSON_ID='https://ergysshehu.com/#ergys-shehu';
export const WEBSITE_ID='https://ergysshehu.com/#website';
export const KULT360_ID='https://kult360.com/#organization';
// User-supplied biography and contact details. Sanity values override these defaults.
export const defaults = {
  name: 'Ergys Shehu', headline: 'Stories\nin light.',
  intro: 'Fashion, editorial weddings, and cinematic direction —\nAlbania / Worldwide.',
  aboutHeading: 'Purity. Simplicity.\nHonesty.',
  bio: 'Since 2017, Ergys Shehu has worked as a freelance fashion and beauty photographer, collaborating with celebrities, models and national and international clients. Purity, simplicity and honesty characterise his photographic style. He lives and works in Albania.',
  email: 'e.ergysshehu@gmail.com', instagram: 'https://instagram.com/ergys.shehu',
  youtube: 'https://www.youtube.com/@ErgysShehu', kult360: 'https://kult360.com',
  linkedin: 'https://www.linkedin.com/in/ergysshehu/', facebook: 'https://www.facebook.com/ergysshehuphotography',
  seoDescription: 'Ergys Shehu — Photographer and Director. Fashion, editorial weddings, film and music videos. Albania / Worldwide.'
};
// Featured YouTube films — shown on the /films/ page. IDs only; each video's
// own title renders inside the YouTube player once played, so we don't need
// to hardcode titles we can't verify. Where the client gave us a real title
// (from their own Instagram caption for this same edit) we use it as the label.
export const films = [
  {id: '_yur69PW-10', label: 'Kujtimi (Remix)'},
  {id: 'o01_26Q2SfY'},
  {id: '3WgyoTNFw7I'}
] as const;
export const biography = {
  en: 'Born in Shkodër, Ergys Shehu brings a background in painting and graphic design to photography, film and creative direction. His work moves between fashion and beauty, commercial campaigns, music videos and cultural projects.\n\nIn 2017, he founded ALERDIGITALMEDIA. In 2020, he received the Best Director award at Netët e Klipit Shqiptar. Alongside his photographic practice, he has worked on Islamic decorative art and murals in more than 40 places of worship across the Balkans and Europe, combining calligraphy, geometric patterns and arabesque motifs.\n\nAs Executive Director of the Kult 360 Foundation, he connects cultural heritage with contemporary visual production and immersive technologies. He lives and works in Albania.',
  sq: 'Ergys Shehu ka lindur në Shkodër. Që në moshë të re, ai shfaqi pasion për pikturën. Në vitin 2005 nisi mësimet në degën e pikturës në liceun artistik në Shkodër, për të vazhduar më pas studimet në arte pranë Universitetit të Shkodrës, me formim në pikturë, grafikë, fotografi dhe teknika digjitale.\n\nI specializuar në fotografinë e modës dhe bukurisë, Shehu ka zhvilluar një stil të dallueshëm dhe bashkëpunon me agjenci, modele, artistë dhe profesionistë të grimit e stilimit. Në vitin 2017 themeloi ALERDIGITALMEDIA, kushtuar fotografisë, videove muzikore dhe ceremonive martesore. Në vitin 2020 u vlerësua me çmimin Best Director në Netët e Klipit Shqiptar.\n\nPraktika e tij përfshin gjithashtu artin dekorativ islam, me murale në mbi 40 objekte kulti në Ballkan dhe Europë. Në rolin e Drejtorit Ekzekutiv të Fondacionit Kult 360, ai ndërthur trashëgiminë kulturore me prodhimin vizual dhe teknologjitë immersive. Jeton dhe punon në Shqipëri.',
  quote: 'Vision does not ask for permission. It demands a field of action. In the digital age, man is the important creative mind, not the algorithm. True art is complicated human simplicity; it is the clear voice amidst the noise.'
};
// subtitle is the short line rendered on the page itself (kept as-is,
// unchanged) — seoDescription is a separate, longer line used only for the
// meta description/OG tags, since a one-word subtitle isn't a real
// description on its own.
export const sections = [
  {slug:'fashion', title:'Fashion', subtitle:'Editorials & Campaigns', texture:'t-fashion', seoDescription:'Fashion editorial and campaign photography by Ergys Shehu, based in Albania and available worldwide.'},
  {slug:'weddings', title:'Weddings', subtitle:'People in love', texture:'t-wedding', seoDescription:'Wedding photography and film by Ergys Shehu — timeless, emotive coverage for couples in Albania and beyond.'},
  {slug:'portraits', title:'Portraits', subtitle:'Beauty in reality', texture:'t-portrait', seoDescription:'Portrait photography by Ergys Shehu — honest, editorial portraits shot in Albania and worldwide.'},
  {slug:'films', title:'Film & Video', subtitle:'Music videos, short films and visual stories.', texture:'film-image', seoDescription:'Music videos, short films and visual storytelling directed by Ergys Shehu.'}
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
