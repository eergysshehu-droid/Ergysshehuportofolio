import process from 'node:process';
import {defineCliConfig} from 'sanity/cli';
export default defineCliConfig({api: {
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '46mghxoy',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production'
}});
