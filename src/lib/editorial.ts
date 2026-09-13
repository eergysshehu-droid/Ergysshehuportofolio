// Copy supplied in ergys-shehu-portfolio-v2.zip. Sanity values override these defaults.
export const defaults = {
  name: 'Ergys Shehu', headline: 'Stories\nin light.',
  intro: 'Fashion, editorial weddings, and cinematic direction —\nAlbania / Worldwide.',
  aboutHeading: 'A visual storyteller\nbased in Albania,\nworking worldwide.',
  bio: 'I’m Ergys Shehu, a photographer and director, drawn to people, light and what stays between the frames. From fashion to weddings to film, my work is about honest emotions and a cinematic point of view.',
  email: 'e.ergysshehu@gmail.com', instagram: 'https://instagram.com/ergys.shehu',
  seoDescription: 'Ergys Shehu — Photographer and Director. Fashion, editorial weddings, film and music videos. Albania / Worldwide.'
};
export const sections = [
  {slug:'fashion', title:'Fashion', subtitle:'Editorials & Campaigns', texture:'t-fashion'},
  {slug:'weddings', title:'Weddings', subtitle:'People in love', texture:'t-wedding'},
  {slug:'portraits', title:'Portraits', subtitle:'Beauty in reality', texture:'t-portrait'},
  {slug:'films', title:'Film & Video', subtitle:'Music videos, short films and visual stories.', texture:'film-image'}
] as const;
