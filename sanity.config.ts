import process from 'node:process';
import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {schemaTypes} from './studio/schemaTypes';
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '46mghxoy';
if (!projectId) throw new Error('Set SANITY_STUDIO_PROJECT_ID in .env to your existing Sanity project ID.');
export default defineConfig({
  name: 'portfolio', title: 'Ergys Shehu — Portfolio', projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({structure: S => S.list().title('Portfolio').items([
    S.listItem().title('Profili dhe kontakti').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ...S.documentTypeListItems().filter(item => item.getId() !== 'siteSettings')
  ])})],
  schema: {types: schemaTypes, templates: templates => templates.filter(t => t.schemaType !== 'siteSettings')},
  document: {actions: (actions, context) => context.schemaType === 'siteSettings' ? actions.filter(a => a.action !== 'duplicate' && a.action !== 'delete') : actions}
});
